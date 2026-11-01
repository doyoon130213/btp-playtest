/* 기획서(docs/game-design.md)에서 옮긴 데이터. 수치를 바꾸려면 기획서와 함께 고친다. */
window.DATA = (function () {
  'use strict';

  /* 탭 8: 메인 챕터. 시계, 스폰 최대치, 구간 계수는 챕터 구간별로 정해진다. */
  const CH = [
    ['오염된 항구', 0, 50, '유광층', '망둥어', '기름 해파리, 변이 정어리', '수압 고리 안내 (튜토리얼)', '왕집게', 120, 1100, 300, 100],
    ['기름띠 연안', 50, 200, '유광층', '정어리 떼', '폐선 따개비, 독성 복어', '기름띠: 들어가면 둔화', '기름 여왕', 163, 1430, 336, 112],
    ['폐그물 해초숲', 200, 400, '박광층', '해마 무리', '플라스틱 새우, 녹슨 기뢰어', '그물 덤불: 파괴 가능, 시야 가림', '암초 곰치', 222, 1859, 376, 125],
    ['난파선 묘지', 400, 700, '박광층', '쏠배감펭', '방사능 곰치, 전기 장어 유생', '잔해 장애물: 양쪽 탄을 막는다', '폐선령', 302, 2417, 421, 140],
    ['방전 산호초', 700, 1000, '박광층', '나폴레옹피시', '폐드론 잠수정, 전기 장어 유생', '방전 구역: 경고 1.5초, 적도 피해', '방전 철갑상어', 411, 3142, 472, 157],
    ['심해 채굴장', 1000, 1500, '무광층', '심해 가재', '변이 게 군단병, 강철 소라게', '낙석: 경고 후 장애물 생성', '굴착기 MK-9', 521, 3833, 529, 176],
    ['먹물 해구', 1500, 2200, '무광층', '오징어', '잉크 오징어, 변이 게 군단병', '먹물 구름: 주기적 시야 가림', '먹물 크라켄', 662, 4676, 592, 197],
    ['독성 열수 분출구', 2200, 3000, '무광층', '관벌레', '독성 복어, 강철 소라게', '열수 기둥: 피해 후 이동 가속 통로', '독니 바다뱀왕', 841, 5705, 663, 221],
    ['방사능 폐기장', 3000, 4000, '무광층', '초롱아귀', '심해 아귀, 방사능 곰치', '드럼통: 터지면 적도 피해', '방사능 아귀', 1068, 6960, 743, 248],
    ['컨테이너 협곡', 4000, 5000, '심해층', '덤보문어', '폐기물 문어, 폐드론 잠수정', '좁은 협곡과 떨어지는 컨테이너', '폐기물 골렘', 1356, 8491, 832, 277],
    ['고래 무덤', 5000, 6000, '심해층', '향유고래', '변이 상어, 심해 아귀', '고래뼈 장애물, 주기적 음파 넉백', '변이 향유고래', 1722, 10359, 932, 311],
    ['얼어붙은 심층수', 6000, 7000, '초심해층', '심해 해파리', '강철 소라게, 폐기물 문어', '얼음 바닥: 관성 0.45초', '쌍두 크라켄', 2188, 12638, 1044, 348],
    ['수압 붕괴대', 7000, 8500, '초심해층', '심해 새우', '변이 게 군단병, 심해 아귀', '수압 벽: 가장자리 수축, 고리 상승 1.5배', '개조 골렘', 2778, 15419, 1169, 390],
    ['검은 해류', 8500, 10000, '초심해층', '심해 해삼', '폐기물 문어, 강철 소라게', '해류가 화면 전체로 커져 20초마다 방향 변경', '아귀 고래', 3528, 18811, 1309, 436],
    ['검은 해구 심층', 10000, 10900, '초심해층', '꼼치', '전 종류 강화', '이전 기믹 순환, 어둠', '심연의 눈', 4481, 22949, 1466, 489],
  ];
  const chapters = CH.map((c, i) => {
    const no = i + 1, group = no <= 5 ? 0 : no <= 10 ? 1 : 2;
    return {
      no, name: c[0], from: c[1], to: c[2], layer: c[3], creature: c[4], enemies: c[5], gimmick: c[6], boss: c[7],
      refAtk: c[8], refHp: c[9], gold: c[10], exploreGold: c[11],
      clock: [480, 600, 720][group], peak: [22, 26, 30][group], zone: [0.7, 0.85, 1][group],
      density: [1, 1.2, 1.4][group],
      bosses: [[{ at: 240, hp: 370 }, { at: 480, hp: 1360, final: true }], [{ at: 210, hp: 330 }, { at: 420, hp: 630 }, { at: 600, hp: 1790, final: true }], [{ at: 240, hp: 330 }, { at: 480, hp: 945 }, { at: 720, hp: 1960, final: true }]][group],
      elites: [[150, 330, 420], [120, 300, 500, 560], [150, 360, 420, 600, 660]][group],
    };
  });

  const modes = [
    { name: '골드 해구', unlock: 2, rule: '시계 3분, 골드 구슬만 나오는 물량전', limit: '하루 1회', reward: '클리어 골드의 3배' },
    { name: '설계도 창고', unlock: 3, rule: '시계 3분, 정예 5체 연속 처치', limit: '하루 1회', reward: '설계도 10개' },
    { name: '보스 러시', unlock: 5, rule: '보스 5체 연속', limit: '주 3회', reward: '진주, 잠수함 조각' },
    { name: '수압 시험', unlock: 8, rule: '매주 변형 규칙', limit: '주 3회', reward: '파일럿 조각, 시즌 포인트' },
    { name: '끝없는 잠항', unlock: 10, rule: '버틴 시간을 수심으로 겨루기', limit: '하루 1회', reward: '시즌 순위 보상' },
  ];

  /* 탭 3: 잠수함 10종 */
  const subs = [
    { id: 'coral', name: '산호 1호', type: '균형형', unlockText: '시작 지급', unlock: 0, speed: 100, hp: 1.00, atk: 1.00,
      passive: '안정된 설계: 레벨업할 때마다 내구도 3% 회복', active: '일제 사격: 전방위 어뢰 12발, 1발 150% (30초)', water: '방출 시 내구도 5% 회복', tip: '큰 원을 그리며 이동한다. 실수를 만회하기 쉬워 입문용이다.',
      stars: ['회복 4%', '어뢰 16발', '쿨 25초', '리롤 +1', '회복 6%, 어뢰 24발'] },
    { id: 'current', name: '물살치기', type: '기동형', unlockText: '챕터 2 클리어', unlock: 2, speed: 125, hp: 0.80, atk: 0.95,
      passive: '유선형 선체: 이동 중 피해 회피 15%', active: '급가속: 2초 무적 돌진, 경로의 적에게 300% (18초)', water: '해류가 미는 힘 2배, 거슬러도 감속 없음', tip: '적 떼를 바깥에서 끌고 돌며 구슬을 쓸어 담는다.',
      stars: ['회피 20%', '돌진 450%', '쿨 14초', '이동 +10', '회피 25%, 돌진 2회 충전'] },
    { id: 'turtle', name: '강철거북', type: '장갑형', unlockText: '챕터 3 클리어', unlock: 3, speed: 85, hp: 1.40, atk: 0.90,
      passive: '이중 장갑: 받는 피해 −12%, 피격 무적 +0.2초', active: '수압 방벽: 4초간 받는 피해 −70%, 주변 적 밀침 (30초)', water: '수압 상승 ×1.5, 밀어냄 +2m', tip: '포위를 감수하고 근접 범위 스킬로 버틴다.',
      stars: ['피해 −15%', '방벽 5초', '쿨 24초', '내구도 50% 이하 피해 −10% 추가', '치명적 피해 1회 무효'] },
    { id: 'hammer', name: '망치상어', type: '화력형', unlockText: '챕터 4 클리어', unlock: 4, speed: 100, hp: 0.85, atk: 1.25,
      passive: '과잉 화력: 주포 피해 +25%, 치명 확률 +8%', active: '포문 개방: 6초간 모든 발사체 간격 −50% (35초)', water: '방출 피해 500%, 밀어냄 −2m', tip: '정예와 보스를 빠르게 끊는다. 내구도가 낮다.',
      stars: ['주포 +35%', '치명 +12%', '포문 8초', '치명 피해 +30%', '주포 +50%, 포문 중 관통 +1'] },
    { id: 'bolt', name: '볼트일', type: '전류형', unlockText: '챕터 5 클리어', unlock: 5, speed: 105, hp: 0.90, atk: 1.05,
      passive: '누전 회로: 전류 스킬 피해 +30%, 모든 공격 10% 확률 감전', active: '전자기 폭풍: 화면의 적 최대 30체에 250%, 1.5초 기절 (32초)', water: '밀어낸 적 전부 감전', tip: '전류 스킬 2개를 먼저 확보한다.',
      stars: ['전류 +40%', '감전 15%', '대상 40체', '감전 적 받는 피해 +15%', '전류 +60%, 기절 2.5초'] },
    { id: 'orca', name: '오르카', type: '어뢰형', unlockText: '챕터 6 클리어', unlock: 6, speed: 95, hp: 1.05, atk: 1.10,
      passive: '자동 장전: 어뢰 계열 폭발 반경 +25%, 피해 +15%', active: '대형 어뢰: 가장 밀집한 지점에 900%, 반경 5m (28초)', water: '방출 시 유도 어뢰 6발, 1발 100%', tip: '적을 한쪽으로 모아 폭발로 없앤다.',
      stars: ['반경 +35%', '피해 +25%', '대형 어뢰 1,200%', '쿨 22초', '대형 어뢰 2발'] },
    { id: 'medi', name: '메디벨', type: '지원형', unlockText: '출석 7일 또는 챕터 8 클리어', unlock: 8, speed: 100, hp: 1.15, atk: 0.90,
      passive: '수리 모듈: 초당 내구도 0.5% 회복, 소환물 피해 +25%', active: '수리 파동: 내구도 30% 즉시 회복, 5초간 소환물 공격 속도 +50% (40초)', water: '방출 시 소환물 공격 속도 +50%, 3초', tip: '소환물에 공격을 맡기고 회복으로 산다.',
      stars: ['회복 0.7%', '소환물 +35%', '파동 40% 회복', '쿨 30초', '회복 1%, 부활 시 내구도 100%'] },
    { id: 'ray', name: '그림자 가오리', type: '은신형', unlockText: '챕터 9 클리어', unlock: 9, speed: 110, hp: 0.85, atk: 1.10,
      passive: '음향 흡수: 손을 떼고 0.5초 뒤 은신. 재사용 10초', active: '연막 잠항: 5초 은신, 이동 +30, 해제 후 첫 공격 +200% (25초)', water: '소나 핑 재사용 1초, 핑이 나갈 때마다 음향 흡수 재사용 −1초', tip: '손을 떼고 대는 리듬으로 은신을 반복한다.',
      stars: ['은신 4초', '재사용 8초', '첫 공격 +80%', '연막 7초', '은신 중 피해 1회 무효, 첫 공격 +120%'] },
    { id: 'drill', name: '천공정', type: '채굴형(근접)', unlockText: '챕터 10 클리어', unlock: 10, speed: 110, hp: 1.20, atk: 1.00,
      passive: '드릴 선수: 접촉한 적에게 초당 200%, 받는 접촉 피해 −40%', active: '회전 돌격: 3초간 반경 3m에 0.2초마다 150% (22초)', water: '수압 상승 ×1.3, 방출 후 3초간 드릴 피해 2배', tip: '적 떼로 파고들어 갈아낸다.',
      stars: ['드릴 300%', '접촉 피해 −50%', '돌격 4초', '쿨 17초', '드릴 500%, 돌격 중 무적'] },
    { id: 'octo', name: '어미문어', type: '모함형(소환)', unlockText: '챕터 12 클리어', unlock: 12, speed: 90, hp: 1.10, atk: 0.95,
      passive: '촉수 격납고: 소환 스킬 수량 +1, 소환물 피해 +20%', active: '전 함대 출격: 드론 6기 10초 소환, 1기 0.25초마다 50% (38초)', water: '해류 안에서 소환물 공격 속도 +30%', tip: '소환물로 화면을 채우고 크게 움직이지 않는다.',
      stars: ['소환물 +30%', '드론 8기', '쿨 30초', '소환 간격 −15%', '수량 +2, 드론 12기'] },
  ];

  /* 탭 4: 파일럿 12종 */
  const pilots = [
    { id: 'coral', name: '코랄', species: '수달', story: '구조대 막내 정비사. 조개를 두드리는 버릇으로 뭐든 고친다.', unlockText: '시작 지급', unlock: 0, bonusText: '공격력 +5%, 이동 +3', atk: 5, hp: 0, move: 3, skill: '고대 무인 잠수정', skillId: 'ancientDrone', passive: '손재주: 레벨업 카드 리롤 런당 +1회', rec: '산호 1호' },
    { id: 'bingo', name: '빙고', species: '펭귄', story: '남극 구조대 출신. 미끄러지듯 움직이는 기동 전문가.', unlockText: '챕터 1 클리어', unlock: 1, bonusText: '이동 +8', atk: 0, hp: 0, move: 8, skill: '부력 과부하', skillId: 'buoyOverload', passive: '빙판 활주: 이동 중 구슬 흡수 범위 +30%', rec: '물살치기' },
    { id: 'musoe', name: '무쇠', species: '바다거북', story: '120살 노장 잠수사. 등딱지의 흉터가 경력서다.', unlockText: '챕터 2 클리어', unlock: 2, bonusText: '내구도 +10%', atk: 0, hp: 10, move: 0, skill: '갑각 강화', skillId: 'carapace', passive: '묵직한 등딱지: 내구도 50% 이하일 때 받는 피해 −15%', rec: '강철거북' },
    { id: 'kalnal', name: '칼날', species: '청상아리', story: '전직 사격 교관. 냉정하지만 막내를 잘 챙긴다.', unlockText: '챕터 3 클리어', unlock: 3, bonusText: '공격력 +10%', atk: 10, hp: 0, move: 0, skill: '유령 어뢰', skillId: 'ghostTorpedo', passive: '사냥 본능: 체력 30% 이하인 적에게 피해 +25%', rec: '망치상어' },
    { id: 'parang', name: '파랑', species: '돌고래', story: '음파 분석가. 소나 화면만 보고 어뢰 궤도를 계산한다.', unlockText: '챕터 4 클리어', unlock: 4, bonusText: '공격력 +5%, 스킬 간격 −3%', atk: 5, hp: 0, move: 0, skill: '심연의 울음', skillId: 'abyssCry', passive: '궤도 계산: 폭발이 적 3체 이상을 맞히면 다음 발사 간격 −10%', rec: '오르카' },
    { id: 'jjirit', name: '찌릿', species: '전기뱀장어', story: '구조대 전기 기사. 화가 나면 정전을 일으킨다.', unlockText: '챕터 5 클리어', unlock: 5, bonusText: '공격력 +6%', atk: 6, hp: 0, move: 0, skill: '발광 해파리 무리', skillId: 'lumaJelly', passive: '누전 체질: 감전 지속 +1초, 감전 적 받는 피해 +10%', rec: '볼트일' },
    { id: 'mir', name: '미르', species: '해마', story: '의무 장교. 작은 몸으로 수리 드론 편대를 지휘한다.', unlockText: '출석 7일 또는 챕터 6 클리어', unlock: 6, bonusText: '내구도 +6%, 회복 효과 +10%', atk: 0, hp: 6, move: 0, skill: '심연의 흡수', skillId: 'abyssDrain', passive: '응급 처치: 회복 효과 +30%. 내구도 20% 이하가 되면 5초간 초당 3% 회복', rec: '메디벨' },
    { id: 'jipge', name: '집게 소령', species: '게', story: '해군 출신 현장 지휘관. 말보다 집게가 먼저 나간다.', unlockText: '챕터 7 클리어', unlock: 7, bonusText: '내구도 +8%, 공격력 +3%', atk: 3, hp: 8, move: 0, skill: '산호 가시 폭탄', skillId: 'coralMine', passive: '맞받아치기: 접촉한 적에게 공격력의 150% 반사', rec: '천공정' },
    { id: 'ppogeul', name: '뽀글', species: '복어', story: '겁 많은 폭발물 전문가. 놀라면 부풀고, 부풀면 터진다.', unlockText: '챕터 8 클리어', unlock: 8, bonusText: '내구도 +5%, 공격력 +5%', atk: 5, hp: 5, move: 0, skill: '심해 압력파', skillId: 'pressureWave', passive: '가시 폭발: 기포가 터질 때 반경 3m에 200%', rec: '강철거북' },
    { id: 'deungbul', name: '등불', species: '아귀', story: '심해 출신 정찰병. 어둠 속에서 혼자 빛나는 것이 고민이다.', unlockText: '챕터 9 클리어', unlock: 9, bonusText: '공격력 +8%, 이동 +3', atk: 8, hp: 0, move: 3, skill: '먹물 장막', skillId: 'inkVeil', passive: '심해 시야: 어두운 구역의 시야 제한 무시, 은신 중 치명 확정', rec: '그림자 가오리' },
    { id: 'palryong', name: '팔룡', species: '문어', story: '전직 잠수 함대 사령관. 여덟 팔로 포탑 여덟 대를 조종한다.', unlockText: '챕터 11 클리어', unlock: 11, bonusText: '공격력 +5%, 내구도 +5%', atk: 5, hp: 5, move: 0, skill: '새끼 문어 소환', skillId: 'babyOcto', passive: '다중 조종: 소환물 지속 +25%, 소환물 피해 +15%', rec: '어미문어' },
    { id: 'mulgyeol', name: '물결', species: '바다표범', story: '구조대 보급 담당. 어디서든 쓸 만한 것을 주워 온다.', unlockText: '뽑기 또는 출석 28일', unlock: 99, bonusText: '경험치 +5%, 골드 +10%', atk: 0, hp: 0, move: 0, xp: 5, gold: 10, skill: '조류 타기', skillId: 'currentRide', passive: '알뜰 보급: 경험치 +10%, 런 골드 +15%', rec: '산호 1호' },
  ];

  /* 전투 수정 지시서(docs/combat-fix-spec.md)의 스킬 12종. lv는 레벨마다 바뀌는 값만 적고 앞 레벨 값을 이어받는다. text는 카드 문구다. */
  const carry = rows => rows.map((_, i) => Object.assign({}, ...rows.slice(0, i + 1)));
  const skills = [
    { id: 'abyssCry', name: '심연의 울음', kind: 'attack', pair: 'pressureWave', evolve: '심연의 포효',
      lv: carry([{ cd: 6, r: 4, dmg: 0.9, conf: 2, amp: 0.2 }, { r: 4.5, dmg: 1.15 }, { echo: 0.5 }, { dmg: 1.55, cd: 5, conf: 2.5 }, { again: 0.8, amp: 0.35 }]),
      text: ['6초마다 주변 적에게 울음 90%. 혼란 2초, 받는 피해 +20%', '피해 115%, 반경 4.5m', '혼란 적이 죽으면 메아리 폭발 50%', '피해 155%, 간격 5초, 혼란 2.5초', '0.8초 뒤 한 번 더 운다. 받는 피해 +35%'] },
    { id: 'ghostTorpedo', name: '유령 어뢰', kind: 'attack', pair: 'inkVeil', evolve: '유령 함대',
      lv: carry([{ cd: 2.4, n: 1, dmg: 2, R: 1.4, slow: 0.6, slowT: 2.5 }, { dmg: 2.5 }, { n: 2, whirl: 2 }, { dmg: 3.4, cd: 2 }, { n: 3, R: 2.2, boss: 0.3 }]),
      text: ['투명한 어뢰가 적을 쫓아 200%. 맞은 적 이동 −60%', '피해 250%', '2발, 터진 자리에 둔화 소용돌이', '피해 340%, 간격 2초', '3발, 폭발 범위 확대, 보스 피해 +30%'] },
    { id: 'coralMine', name: '산호 가시 폭탄', kind: 'attack', pair: 'carapace', evolve: '산호 요새',
      lv: carry([{ cd: 3, n: 1, life: 10, max: 5, R: 1.6, dmg: 1.5, slow: 0.4, slowT: 2 }, { cd: 2.6, dmg: 1.9 }, { n: 2, shard: 4, shardDmg: 0.5 }, { dmg: 2.6, max: 9 }, { n: 3, R: 2.2, slow: 0.6 }]),
      text: ['주변에 가시를 심는다. 닿으면 폭발 150%, 이동 −40%', '피해 190%, 간격 2.6초', '2개씩 심고, 폭발 때 파편 4발', '피해 260%, 최대 9개', '3개씩 심고, 폭발 범위 확대, 이동 −60%'] },
    { id: 'pressureWave', name: '심해 압력파', kind: 'attack', pair: 'abyssCry', evolve: '심연의 포효',
      lv: carry([{ cd: 7, r: 4, dmg: 1.2, push: 3, stun: 0.3 }, { r: 4.5, dmg: 1.5 }, { clear: true }, { dmg: 2, cd: 5.5, stun: 0.5 }, { r: 6, stun: 0.8, burst: 0.5 }]),
      text: ['7초마다 주변 적을 3m 밀어내고 120%. 보스 경직', '피해 150%, 반경 4.5m', '범위 안 적 탄 제거', '피해 200%, 간격 5.5초', '반경 6m, 수압 방출 피해 +50%'] },
    { id: 'babyOcto', name: '새끼 문어 소환', kind: 'summon', pair: 'ancientDrone', evolve: '문어 함대',
      lv: carry([{ n: 2, stick: 3, amp: 0.25, tick: 0.5, dmg: 0.3 }, { stick: 3.5, dmg: 0.4 }, { n: 3, pull: 1.5 }, { dmg: 0.6, amp: 0.3 }, { n: 5, amp: 0.4 }]),
      text: ['문어 2마리가 적에 붙어 묶는다. 받는 피해 +25%', '피해 40%, 3.5초', '3마리, 주변 적을 끌어당김', '피해 60%, 받는 피해 +30%', '5마리, 받는 피해 +40%'] },
    { id: 'lumaJelly', name: '발광 해파리 무리', kind: 'summon', pair: 'abyssDrain', evolve: '심해 오로라',
      lv: carry([{ n: 3, orbit: 2.6, dmg: 0.35, miss: 0.25 }, { dmg: 0.45 }, { n: 5, miss: 0.35 }, { dmg: 0.6, orbit: 3.2 }, { n: 7, miss: 0.5, orb: true }]),
      text: ['해파리 3기가 돌며 35%. 근처 적의 공격 25% 빗나감', '피해 45%', '5기, 빗나감 35%', '피해 60%, 궤도 확대', '7기, 빗나감 50%, 현혹 적 처치 시 구슬 +1'] },
    { id: 'ancientDrone', name: '고대 무인 잠수정', kind: 'summon', pair: 'babyOcto', evolve: '문어 함대',
      lv: carry([{ cd: 9, max: 2, shot: 0.5, life: 8, R: 2.2, blast: 3 }, { shot: 0.65, blast: 3.8 }, { max: 3, shard: 6, shardDmg: 0.6 }, { cd: 7, blast: 5 }, { max: 4, R: 3, blast: 7 }]),
      text: ['무인기가 따라다니며 쏘다가 적진에 자폭 300%', '사격 65%, 자폭 380%', '최대 3기, 자폭 파편 6발', '간격 7초, 자폭 500%', '최대 4기, 자폭 700%, 범위 확대'] },
    { id: 'inkVeil', name: '먹물 장막', kind: 'survive', pair: 'ghostTorpedo', evolve: '유령 함대',
      lv: carry([{ cd: 12, dur: 3, r: 2, slow: 0.3, dmg: 0.3 }, { dur: 3.5, dmg: 0.4 }, { conf: 1, move: 0.15 }, { cd: 10, r: 2.6, dmg: 0.6 }, { dur: 4.5, guard: 0.5, blast: 3, blastR: 3 }]),
      text: ['12초마다 은폐. 적은 먹물 구름을 쫓고 구름 안 30%', '3.5초, 피해 40%', '구름 안 적 혼란, 은폐 중 이동 +15%', '간격 10초, 구름 확대, 피해 60%', '4.5초, 받는 피해 −50%, 끝날 때 폭발 300%'] },
    { id: 'buoyOverload', name: '부력 과부하', kind: 'survive', pair: 'currentRide', evolve: '폭류 질주',
      lv: carry([{ move: 0.25, cd: 0.6, R: 1.3, dmg: 0.9 }, { move: 0.3, dmg: 1.15 }, { push: 1, cd: 0.45 }, { move: 0.4, dmg: 1.55 }, { move: 0.5, cd: 0.3, R: 1.7 }]),
      text: ['이동 +25%. 지나간 자리에 기포, 터지면 90%', '이동 +30%, 피해 115%', '기포가 적을 밀어냄, 더 자주', '이동 +40%, 피해 155%', '이동 +50%, 기포 2배, 범위 확대'] },
    { id: 'abyssDrain', name: '심연의 흡수', kind: 'survive', pair: 'lumaJelly', evolve: '심해 오로라',
      lv: carry([{ pull: 0.6, per: 10 }, { pull: 0.9 }, { all: 30 }, { pull: 1.3, per: 8 }, { pull: 2, per: 6, lash: 1.5 }]),
      text: ['구슬 흡수 범위 +60%. 구슬 10개마다 내구도 +1%', '범위 +90%', '30초마다 화면 구슬 전부 회수', '범위 +130%, 8개마다 회복', '범위 +200%, 내구도가 차면 촉수 공격 150%'] },
    { id: 'carapace', name: '갑각 강화', kind: 'survive', pair: 'coralMine', evolve: '산호 요새',
      lv: carry([{ counter: 1.5, r: 2.2, guard: 0.2, guardT: 3 }, { counter: 1.9 }, { guard: 0.3, guardT: 4, push: 2 }, { counter: 2.6, r: 2.8 }, { counter: 4, guard: 0.4, inv: 0.5 }]),
      text: ['맞으면 가시 반격 150%, 3초간 받는 피해 −20%', '반격 190%', '받는 피해 −30% 4초, 반격에 넉백', '반격 260%, 범위 확대', '발동 시 무적 0.5초, −40%, 반격 400%'] },
    { id: 'currentRide', name: '조류 타기', kind: 'survive', pair: 'buoyOverload', evolve: '폭류 질주',
      lv: carry([{ life: 1.2, r: 0.9, dmg: 0.45 }, { life: 1.5, dmg: 0.55 }, { slow: 0.3 }, { dmg: 0.75, r: 1.1 }, { life: 2.5, pop: 0.4 }]),
      text: ['움직이면 잔상이 남아 닿은 적에게 45%', '1.5초 유지, 피해 55%', '잔상 위 적 이동 −30%', '피해 75%, 잔상 확대', '2.5초 유지, 사라질 때 폭발 40%'] },
  ];
  const skillFillers = [
    { id: 'repair', name: '긴급 수리', icon: 'hp', text: '내구도 30% 회복' },
    { id: 'salvage', name: '인양 골드', icon: 'gold', text: '골드 +100' },
    { id: 'sweep', name: '구슬 회수', icon: 'xp', text: '화면의 구슬을 전부 모은다' },
  ];

  /* 공통 성급 (탭 3, 4) */
  const starShards = [0, 10, 30, 70, 150, 310];
  const starGold = [0, 5000, 20000, 80000, 300000, 1000000];

  /* 탭 6: 장비 */
  const slots = [
    { id: '주포', stat: 'atk', weight: 1.0, role: '기본 사격 패턴 결정' },
    { id: '센서', stat: 'atk', weight: 0.6, role: '치명, 구슬 흡수, 위협 표시' },
    { id: '보조', stat: 'atk', weight: 0.6, role: '기본 사격 외 보조 효과' },
    { id: '장갑', stat: 'hp', weight: 1.0, role: '피해 감소' },
    { id: '엔진', stat: 'hp', weight: 0.6, role: '이동과 회복' },
    { id: '특수모듈', stat: 'hp', weight: 0.6, role: 'HUD 2번 액티브' },
  ];
  const tiers = [
    { name: '일반', group: 0, cap: 10, base: 20, inc: 2, common: 1 },
    { name: '희귀', group: 1, cap: 20, base: 40, inc: 4, common: 3 },
    { name: '영웅', group: 2, cap: 30, base: 90, inc: 8, common: 9 },
    { name: '영웅+1', group: 2, cap: 35, base: 110, inc: 8, common: 18 },
    { name: '영웅+2', group: 2, cap: 40, base: 130, inc: 8, common: 27 },
    { name: '전설', group: 3, cap: 50, base: 220, inc: 16, common: 45 },
    { name: '전설+1', group: 3, cap: 55, base: 260, inc: 16, common: 90 },
    { name: '전설+2', group: 3, cap: 60, base: 300, inc: 16, common: 135 },
    { name: '전설+3', group: 3, cap: 65, base: 340, inc: 16, common: 225 },
    { name: '신화', group: 4, cap: 80, base: 500, inc: 32, common: 315 },
    { name: '신화+1', group: 4, cap: 100, base: 600, inc: 32, common: 630 },
  ];
  /* 합성: 본체 등급 → 재료(등급 번호, 개수), 골드 */
  const merges = [
    { mat: 0, n: 2, gold: 200 }, { mat: 1, n: 2, gold: 1000 }, { mat: 2, n: 1, gold: 3000 }, { mat: 2, n: 1, gold: 5000 }, { mat: 2, n: 2, gold: 15000 },
    { mat: 5, n: 1, gold: 30000 }, { mat: 5, n: 1, gold: 50000 }, { mat: 5, n: 2, gold: 80000 }, { mat: 5, n: 2, gold: 300000 }, { mat: 9, n: 1, gold: 600000 },
  ];
  const sets = {
    '심연 사냥꾼': { dir: '단일 공격', two: '공격력 +8%', four: '치명 피해 +30%', six: '정예·보스 피해 +25%' },
    '강철 고래': { dir: '생존', two: '내구도 +10%', four: '받는 피해 −10%', six: '치명적 피해 1회 무효, 3초 무적' },
    '번개 해파리': { dir: '범위·전류', two: '스킬 범위 +10%', four: '범위 스킬 피해 +20%', six: '모든 공격 15% 감전' },
    '유령 잠수정': { dir: '기동·은신', two: '이동 +6', four: '슬로우 중 회피 +30%', six: '액티브 사용 후 3초 은신' },
  };
  const GE = [
    ['twinHarpoon', '주포', '쌍열 작살포', '심연 사냥꾼', '가까운 적에게 2연발, 1발 50%, 간격 0.5초', '3번째 사격마다 관통'],
    ['scatter', '주포', '전방 산탄포', '강철 고래', '부채꼴 5발, 1발 40%, 간격 0.8초, 사거리 6m', '명중 시 넉백'],
    ['coilGun', '주포', '전류 코일건', '번개 해파리', '번개 70%, 연쇄 2체, 간격 0.5초', '연쇄 +1'],
    ['torpedo', '주포', '유도 어뢰관', '유령 잠수정', '추적 어뢰 200%, 간격 1.0초', '은신 해제 직후 1발 3배'],
    /* 아이콘 시안에서 더한 주포 6종. 기획서에 없고 효과 문구는 임시다(prototype/README.md). */
    ['depthMortar', '주포', '폭뢰 박격포', '번개 해파리', '밀집한 곳에 폭뢰 곡사, 반경 2m 140%, 간격 1.2초', '폭발 자리에 1.5초 둔화 소용돌이'],
    ['sonarCannon', '주포', '소나 파동포', '강철 고래', '전방 부채꼴 충격파 90%, 1m 밀어냄, 간격 1.0초', '3번째 파동마다 적 탄 제거'],
    ['trident', '주포', '포세이돈의 삼지창', '심연 사냥꾼', '전방 3연속 찌르기, 1타 60%, 관통, 간격 0.9초', '찌를 때마다 물기둥 120%'],
    ['krakenCannon', '주포', '크라켄 촉수포', '유령 잠수정', '촉수로 적 1체를 0.8초 붙잡고 0.2초마다 40%, 간격 1.1초', '붙잡은 적을 주변에 내리쳐 150%'],
    ['laserTrident', '주포', '심연 레이저 삼지창', '번개 해파리', '가까운 적에게 광선 1.2초, 0.1초마다 12%, 간격 1.6초', '광선이 세 갈래로 갈라짐'],
    ['pearlSniper', '주포', '진주 저격포', '심연 사냥꾼', '가장 먼 적에게 단발 320%, 관통 2, 간격 1.8초', '정예·보스에게 치명 확정'],
    ['sideGun', '보조', '측면 기관포', '심연 사냥꾼', '좌우 자동 사격, 1발 25%, 간격 0.4초', '치명 확률 +6%'],
    ['shieldDrone', '보조', '방패 드론', '강철 고래', '3초마다 적 탄 1발 차단', '드론 2기'],
    ['tesla', '보조', '테슬라 안테나', '번개 해파리', '6초마다 주변 5체 80%, 감전', '간격 4초'],
    ['smoke', '보조', '연막 발사기', '유령 잠수정', '피격 시 연막 3초, 적 탄 명중 −50%', '연막 중 이동 +20'],
    ['aim', '센서', '정밀 표적기', '심연 사냥꾼', '치명 확률 +5%', '정예·보스 피해 +10%'],
    ['sonar', '센서', '심해 음탐기', '강철 고래', '화면 밖 위협 표시, 경고선 +0.1초', '보스 패턴 피해 −8%'],
    ['magnet', '센서', '자기장 탐지기', '번개 해파리', '구슬 흡수 범위 +30%', '구슬 회수 시 5% 확률 번개'],
    ['thermal', '센서', '열 은폐 센서', '유령 잠수정', '적 탐지 거리 −15%', '슬로우 중 받는 피해 −15%'],
    ['sawArmor', '장갑', '톱니 장갑', '심연 사냥꾼', '접촉한 적에게 100% 반사', '반사 시 출혈'],
    ['whaleArmor', '장갑', '고래가죽 장갑', '강철 고래', '받는 피해 −6%', '피격 무적 +0.1초'],
    ['insulated', '장갑', '절연 장갑', '번개 해파리', '전류 피해 −50%', '전류 피격 시 주변 방전 150%'],
    ['ghostCoat', '장갑', '유령 코팅', '유령 잠수정', '회피 +5%', '회피 성공 시 2초간 이동 +10'],
    ['supercharge', '엔진', '과급 스크류', '심연 사냥꾼', '이동 +5', '이동 중 피해 +8%'],
    ['diesel', '엔진', '심해 디젤 심장', '강철 고래', '초당 내구도 +0.2%', '내구도 30% 이하 초당 +0.5%'],
    ['turbine', '엔진', '전기 터빈', '번개 해파리', '이동 +4, 스킬 간격 −3%', '감전 적 근처에서 이동 +10'],
    ['silent', '엔진', '저소음 프로펠러', '유령 잠수정', '이동 +6', '손을 떼고 0.5초 뒤 은신 1초'],
    ['overload', '특수모듈', '과부하 탄창', '심연 사냥꾼', '액티브: 6초간 공격 속도 +60%, 쿨 30초', '지속 8초'],
    ['repair', '특수모듈', '긴급 수리 키트', '강철 고래', '액티브: 내구도 40% 회복, 쿨 45초', '회복 50%'],
    ['emp', '특수모듈', 'EMP 폭탄', '번개 해파리', '액티브: 화면 적 3초 마비, 쿨 40초', '마비 적 받는 피해 +30%'],
    ['decoy', '특수모듈', '유령 미끼', '유령 잠수정', '액티브: 미끼 5초, 적 유인, 쿨 30초', '미끼가 터질 때 500%'],
  ];
  const items = {};
  GE.forEach(g => { items[g[0]] = { id: g[0], slot: g[1], name: g[2], set: g[3], effect: g[4], legend: g[5] }; });

  /* 탭 9: 뽑기 확률 */
  const chests = {
    normal: { name: '일반 보급 상자', price: 90, rates: [['일반', 90, 0], ['희귀', 9.5, 1], ['영웅', 0.5, 2]], pityText: '없음', freeText: '하루 무료 1회' },
    advanced: { name: '고급 보급 상자', price: 300, price10: 2700, rates: [['희귀', 80, 1], ['영웅', 19, 2], ['전설', 1, 5]], pityText: '영웅 10회, 전설 80회', pityHero: 10, pityLegend: 80, freeText: '없음' },
    subShard: { name: '잠수함 조각 상자', price: 300, price10: 2700, shard: 'sub', rates: [['조각 5개', 70, 5], ['조각 10개', 25, 10], ['조각 20개', 5, 20]], pityText: '픽업 60회', freeText: '주 1회' },
    pilotShard: { name: '파일럿 조각 상자', price: 300, price10: 2700, shard: 'pilot', rates: [['조각 5개', 70, 5], ['조각 10개', 25, 10], ['조각 20개', 5, 20]], pityText: '픽업 60회', freeText: '주 1회' },
  };
  const shop = {
    pearl: [['진주 60', 1100, '최초 구매 2배'], ['진주 330', 5500, ''], ['진주 720', 11000, ''], ['진주 2,300', 33000, ''], ['진주 4,800', 66000, ''], ['진주 8,400', 110000, '']],
    packages: [
      ['초보자 패키지', 1100, '진주 300, 영웅 주포 선택권, 골드 5,000', '가입 72시간 한정, 1회'],
      ['일일 패키지', 1100, '진주 100, 산소 30, 설계도 20', '하루 1회'],
      ['주간 패키지', 5500, '진주 800, 고급 상자 2, 조각 20', '주 1회'],
      ['월정액', 5500, '즉시 진주 300, 30일간 매일 100', '광고 보상 즉시 수령'],
    ],
  };

  /* 탭 9: 미션 */
  const dailyMissions = [
    { id: 'login', name: '로그인', pts: 10, need: 1 },
    { id: 'sortie1', name: '출격 1회', pts: 15, need: 1, track: 'sortie' },
    { id: 'sortie3', name: '출격 3회', pts: 20, need: 3, track: 'sortie' },
    { id: 'kills', name: '잡몹 1,000체 처치', pts: 15, need: 1000, track: 'kills' },
    { id: 'upgrade', name: '장비 강화 1회', pts: 10, need: 1, track: 'upgrade' },
    { id: 'explore', name: '자동 탐사 보상 수령', pts: 10, need: 1, track: 'explore' },
    { id: 'mode', name: '도전 모드 1회', pts: 10, need: 1, track: 'mode' },
    { id: 'gacha', name: '광고 1회 또는 무료 뽑기 1회', pts: 10, need: 1, track: 'gacha' },
  ];
  const dailyTiers = [
    { at: 20, text: '골드', gold: 1500 },
    { at: 40, text: '설계도 6개', bp: 6 },
    { at: 60, text: '진주 20', pearl: 20 },
    { at: 80, text: '산소 10', oxygen: 10 },
    { at: 100, text: '진주 30', pearl: 30 },
  ];

  const enemies = [
    { kind: 0, name: '기름 해파리', grade: 'T1', action: '일렁이며 직진. 가장 흔한 물량' },
    { kind: 1, name: '변이 정어리', grade: 'T1', action: '떼로 일직선 돌진' },
    { kind: 2, name: '독성 복어', grade: 'T2', action: '사망 시 독 구름 3초, 부풀면 탄 6발' },
    { kind: 3, name: '대왕 기름 해파리', grade: '정예', action: '체력 50%에서 4개로 분열. 처치하면 상자' },
    { kind: 5, name: '왕집게', grade: '보스', action: '집게 쓸기, 돌진, 그물 투척' },
  ];

  return { chapters, modes, subs, pilots, skills, skillFillers, starShards, starGold, slots, tiers, merges, sets, items, chests, shop, dailyMissions, dailyTiers, enemies };
})();
