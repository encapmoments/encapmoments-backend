// services/missionService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.completeMission = async (userId, missionType, missionId) => {
  try {
    let reward = 0;

    if (missionType === 'daily') {
      const mission = await prisma.daily_mission.findUnique({
        where: {
          daily_id_id: {
            id: userId,
            daily_id: missionId
          }
        }
      });

      if (!mission || mission.is_completed) throw new Error('이미 완료했거나 존재하지 않는 미션입니다.');

      reward = mission.reward;

      await prisma.daily_mission.update({
        where: {
          daily_id_id: {
            id: userId,
            daily_id: missionId
          }
        },
        data: { is_completed: true }
      });

    } else if (missionType === 'weekly') {
      const mission = await prisma.weekly_mission.findUnique({
        where: {
          weekly_id_id: {
            id: userId,
            weekly_id: missionId
          }
        }
      });

      if (!mission || mission.is_completed) throw new Error('이미 완료했거나 존재하지 않는 미션입니다.');

      reward = mission.reward;

      await prisma.weekly_mission.update({
        where: {
          weekly_id_id: {
            id: userId,
            weekly_id: missionId
          }
        },
        data: { is_completed: true }
      });

    } else {
      throw new Error('잘못된 missionType입니다.');
    }

    // 프로필에 reward 포인트 추가
    await prisma.profile.update({
      where: { id: userId },
      data: {
        points: {
          increment: reward
        }
      }
    });

    return { success: true, reward };

  } catch (err) {
    throw new Error(`미션 완료 처리 실패: ${err.message}`);
  }
};
