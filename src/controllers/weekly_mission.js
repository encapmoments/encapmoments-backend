const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { openai } = require('../utils/openai');


// 전체 주간 미션 조회
exports.getWeeklyMissions = async (req, res) => {
  const userId = req.user.id;

  try {
    const missions = await prisma.weekly_mission.findMany({
      where: {
        id: userId,
        expires_at: { gt: new Date() }  // 아직 유효한 것만
      },
      select: {
        weekly_id: true,
        weekly_image: true,
        weekly_title: true,
        reward: true,
        expires_at: true
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    res.json(missions);
  } catch (err) {
    console.error('주간 미션 전체 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 특정 주간 미션 상세 조회
exports.getWeeklyMissionDetail = async (req, res) => {
  const userId = req.user.id;
  const weeklyId = parseInt(req.params.weekly_id);

  try {
    const mission = await prisma.weekly_mission.findUnique({
      where: {
        weekly_id_id: {
          weekly_id: weeklyId,
          id: userId
        }
      },
      select: {
        weekly_id: true,
        weekly_image: true,
        weekly_title: true,
        reward: true,
        expires_at: true
      }
    });

    if (!mission) {
      return res.status(404).json({ message: '미션을 찾을 수 없습니다.' });
    }

    res.json(mission);
  } catch (err) {
    console.error('주간 미션 상세 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 주간 미션 생성
exports.generateWeeklyMissions = async (req, res) => {
  const userId = req.user.id;
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: '미션 주제를 입력해주세요.' });
  }

  try {
    // 1. GPT 프롬프트 생성
      const prompt = `
"${topic}"을 주제로 한 주간 미션 3개를 순수한 JSON 형식으로 출력해줘.
아무 말도 하지 말고 아래 형식으로만 응답해:

[
  {
    "weekly_title": "미션 제목",
    "weekly_description": "미션 설명"
  },
  ...
]
`;

    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    // 2. 응답 파싱
    let missions;
    try {
      missions = JSON.parse(gptRes.choices[0].message.content.trim());
    } catch (err) {
      return res.status(500).json({ message: 'GPT 응답 파싱 실패', error: err });
    }

    // 3. 이미지 생성 (DALL·E)
    const imageUrls = await Promise.all(
      missions.map(async (mission) => {
        const dalleRes = await openai.images.generate({
          model: 'dall-e-3',
          prompt: `${mission.weekly_title} - ${mission.weekly_description}`,
          size: '1024x1024',
          n: 1
        });
        return dalleRes.data[0].url;
      })
    );

    // 4. DB 저장
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const createdMissions = await Promise.all(
      missions.map((m, i) =>
        prisma.weekly_mission.create({
          data: {
            id: userId,
            weekly_title: m.weekly_title,
            weekly_description: m.weekly_description,
            weekly_image: imageUrls[i],
            reward: 100,
            is_completed: false,
            created_at: now,
            expires_at: expiresAt
          },
          select: {
            weekly_id: true,
            weekly_title: true,
            weekly_description: true,
            weekly_image: true,
            reward: true,
            expires_at: true
          }
        })
      )
    );

    res.status(201).json({
      message: '주간 미션이 성공적으로 생성되었습니다.',
      missions: createdMissions
    });
  } catch (err) {
    console.error('주간 미션 생성 실패:', err);
    res.status(500).json({ message: '서버 오류 발생', error: err.message });
  }
};