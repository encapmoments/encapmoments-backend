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
