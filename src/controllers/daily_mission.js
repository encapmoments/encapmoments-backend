const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// 전체 조회
exports.getDailyMissions = async (req, res) => {
    const userId = req.user.id;
    const now = new Date(); // 현재 시각
  
    try {
      // 1. 아직 만료되지 않은 미션이 있는지 확인
      const activeMissions = await prisma.daily_mission.findMany({
        where: {
          id: userId,
          expires_at: { gt: now } // expires_at > 현재시간
        },
        select: {
          daily_id: true,
          daily_title: true,
          reward: true,
          expires_at: true
        },
        orderBy: {
          created_at: 'asc'
        }
      });
  
      // 2. 만약 없다면 → 새로 5개 생성
      if (activeMissions.length === 0) {
       // 만료된, 수행안한 미션 삭제
        await prisma.daily_mission.deleteMany({
        where: {
          id: userId,
          expires_at: { lt: now },
          is_completed: false
        }
      });

        const allMissions = await prisma.daily_mission_pool.findMany();

        // 배열을 랜덤하게 섞고, 앞에서 5개만 자르기
        const poolMissions = allMissions.sort(() => Math.random() - 0.5).slice(0, 5);
  
        const newMissions = [];
  
        for (const mission of poolMissions) {
          const createdAt = new Date();
          const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24시간 뒤뒤
  
          const created = await prisma.daily_mission.create({
            data: {
              id: userId,
              pool_id: mission.pool_id,
              daily_title: mission.daily_title,
              daily_description: mission.daily_description,
              daily_image: mission.daily_image,
              reward: mission.reward,
              created_at: createdAt,
              expires_at: expiresAt // 직접 저장
            },
            select: {
              daily_id: true,
              daily_title: true,
              reward: true,
              expires_at: true
            }
          });
  
          newMissions.push(created);
        }
  
        return res.json(newMissions);
      }
  
      // 3. 이미 존재하면 그 미션들 그대로 응답
      return res.json(activeMissions);
  
    } catch (err) {
      console.error('데일리 미션 전체 조회 실패:', err);
      return res.status(500).json({ message: '서버 오류' });
    }
  };


// 상세 조회
exports.getDailyMissionDetail = async (req, res) => {
  const userId = req.user.id;
  const dailyId = parseInt(req.params.daily_id);

  try {
    const mission = await prisma.daily_mission.findUnique({
      where: {
        daily_id_id: {
          daily_id: dailyId,
          id: userId
        }
      },
      select: {
        daily_id: true,
        daily_image: true,
        daily_title: true,
        daily_description: true,
        reward: true,
        is_completed: true
      }
    });

    if (!mission) {
      return res.status(404).json({ message: '미션을 찾을 수 없습니다.' });
    }

    res.json(mission);
  } catch (err) {
    console.error('데일리 미션 상세 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};
