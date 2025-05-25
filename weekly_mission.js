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


// DALL·E 프롬프트 생성 함수
function createDallePrompt(title, description, options) {
  const {
    style,
    cameraAngle,
    resolution,
    colorTone,
    mood,
    composition,
    backgroundStyle
  } = options;

  return `${title}: ${description}. ` +
         `In the style of ${style}, ` +
         `${cameraAngle}, ` +
         `${resolution}, ` +
         `${colorTone}, ` +
         `${mood} mood, ` +
         `${composition}, ` +
         `${backgroundStyle}.`;
}

// 주간 미션 생성
exports.generateWeeklyMissions = async (req, res) => {
  const userId = req.user.id;
  const { text, members } = req.body;

  if (!text || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ message: 'text 또는 members 정보가 부족합니다.' });
  }

  try {
    const now = new Date();

    // 1. 만료된 + 완료되지 않은 주간 미션 삭제
    await prisma.weekly_mission.deleteMany({
      where: {
        id: userId,
        expires_at: { lt: now },
        is_completed: false
      }
    });

    // 2. GPT 프롬프트 생성
    const memberDesc = members
      .map(m => `${m.age}세 ${m.gender}`)
      .join(', ');

    const gptPrompt = `
"${text}"라는 상황에서 ${memberDesc}로 구성된 가족을 위한 주간 미션 1개를 아래 조건을 지켜서 JSON으로 출력해줘.

- 모든 미션 제목은 15자 이내의 짧고 명확한 문장
- 모든 미션 설명은 40자 이상 80자 이하의 자연스러운 설명형 문장 (예: '~하는 활동입니다.')
- 아래 JSON 형식 그대로 응답할 것. 주석이나 추가 설명은 포함하지 마:

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
      messages: [{ role: 'user', content: gptPrompt }],
      temperature: 0.8,
      max_tokens: 500,
      presence_penalty: 0.5
    });

    // 3. GPT 응답 파싱
    let missions;
    try {
      missions = JSON.parse(gptRes.choices[0].message.content.trim());
    } catch (err) {
      return res.status(500).json({ message: 'GPT 응답 파싱 실패', error: err });
    }

    // 4. 이미지 생성 (옵션 기반 프롬프트 사용)
    const dalleOptions = {
      style: "a children's book illustration with soft brush strokes",
      cameraAngle: "eye-level medium shot",
      resolution: "high resolution, 1024x1024 aspect ratio",
      colorTone: "pastel colors with warm undertones",
      mood: "cozy and joyful",
      composition: "centered composition",
      backgroundStyle: "simple pastel-colored background"
    };

    const imageUrls = await Promise.all(
      missions.map(async (mission) => {
        const dallePrompt = createDallePrompt(mission.weekly_title, mission.weekly_description, dalleOptions);
        const dalleRes = await openai.images.generate({
          model: 'dall-e-3',
          prompt: dallePrompt,
          size: '1024x1024',
          n: 1
        });
        return dalleRes.data[0].url;
      })
    );

    // 5. DB 저장
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7일 뒤

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

