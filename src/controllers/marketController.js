const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Prisma로 DB를 쓴다면 필수임! 
// Prisma ORM의 런타임 클라이언트
// prisma.user.findMany() 같은 타입 안전한 DB 쿼리를 쓰게 해주는 객체를 생성
// DATABASE_URL(예: MySQL, PostgreSQL) 환경변수를 읽어 DB에 연결



// 컨트롤러 함수 
// Item 목록 조회
exports.getItems = async (req, res) => {
  
  try{
    const items = await prisma.reward_item.findMany({
      orderBy:{
        name: 'asc'   // 이름 오름차순 
      },
      select:{
        item_id: true,
        name: true,
        description: true,
        image_url: true,
        category: true,
        cost: true,
        stock: true
      }
    });

    console.log('[GET] /itmes -> ${items.length}개 반환됨');
    return res.status(200).json({message: '아이템 목록 조회 성공', items});

  } catch (error) {
    console.log('아이템 목록 가져오기 실패:', error);
    return res.status(500).json({message: '서버 에러'});
  }
};

// Item 상세 조회 
exports.getOneItem = async (req, res) => {
  const itemId = parseINT(req.params.item_id);

  if (isNaN(itemId)) {
    return res.status(400).json({ message: '잘못된 item_id 형식입니다. '});
  }

  try{
    const oneItem = await prisma.reward_item.findUnique({
      where: {
        item_id: itemId
      },
      select: {
        item_id: true,
        name: true,
        description: true,
        image_url: true,
        category: true,
        cost: true,
        stock: true,
        created: true
      }
    });

    if (!oneItem) {
      return res.status(404).json({ message: '앨범 없음.'});
    }

    console.log('[GET] /items/:item_id 가져오기 성공');
    return res.status(200).json({message: '아이템 상세 조회 성공', data: oneItem});

  } catch (error) {
    console.error('앨범 상세 조회 실패', error);
    return res.status(500).json({ message: '서버 에러' });
  }
};


// 아이템 구매
exports.purchaseItem = async (req, res) => {
  const itemId = req.body.item_id;
  const userId = req.user.id;

  if(!itemId)
    return res.status(400).json({ message : 'item_id가 필요합니다.'});


  try{
    const item = await prisma.reward_item.findUnique({
      where : {item_id : itemId},
      select : {
        stock : true,
        cost : true
      }
    });

    if(!item)
      return res.status(404).json({ message: '해당 item이 존재하지 않습니다.'});

    if(item.stock==0)
      return res.status(500).json({ message: '재고가 없습니다.'});

    const prof = await prisma.profile.findUnique({
      where : { id : userId}
    });

    if(prof.points < item.cost)
      res.status(400).json({ message : '포인트가 부족합니다.'});


    const stock = await prisma.gifticon_stock.findFirst({
      where : { 
        item_id : itemId,
        is_assigned : false
      },
      orderBy : {
        stock_id : 'asc'
      },
      select :{
        stock_id : true,
        item_id : true
      }
    });
```
    if(!stock) 
      return res.status(400).json({ message : '재고가 부족합니다.'});
      
      어차피 재고 숫자는 위에서 체크하므로 없어도 될 듯
```

    const user = await prisma.user_reward.create({
      data: {
        user_id : userId,
        item_id : stock.item_id,
        stock_id : stock.stock_id
      }
    });

    if(!user)
      return res.status(400).json({ message : 'user_reward 생성에 실패하였습니다'});

    const row = await prisma.profile.update({
      where: {
        id: userId
      },
      data:{
          points: { decrement: item.cost}
      }
    });

    if(!row)
      return res.status(404).json({ message : 'reward 차감에 실패하였습니다. '});

    console.log('아이템 구매 성공하였습니다.');
    return res.status(200).json({ message : '기프티콘 구매 성공', data : row});

  } catch( error ){
    console.error('기프티콘 구매 실패', error);
    return res.status(500).json({ message: '서버 에러' });
  }
};

/*
1. 상품 존재 여부 확인
2. 재고 확인 (프론트에서 품절인 상품은 고를 수도 없게 만들기로 했지만)
3. 보유 포인트가 cost보다 많은지 확인
4. 바코드 재고(gifticon_stock) 중 is_used = false인 것 중 1개 할당
-> stock_id 기준 오름차순으로 조회, item_id가 같고 is_assigned가 false인 첫 번째 stock을 할당
5. user_reward에 등록
6. gifticon_stock.is_used = true로 변경
7. 유저 포인트 차감 

*/