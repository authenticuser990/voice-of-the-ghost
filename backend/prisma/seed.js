import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function yearsAgo(n) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - n)
  return d
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // ── 18+ users ──
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin_demo',
      email: 'admin@votg.local',
      passwordHash,
      role: 'BOTH',
      profile: {
        create: {
          displayName: 'Admin Demo',
          bio: 'This is a demo admin account for VotG.',
          dateOfBirth: yearsAgo(30),
        }
      }
    }
  })
  console.log(`Created admin (30): ${adminUser.username}`)

  const adultUser = await prisma.user.create({
    data: {
      username: 'adult_user',
      email: 'adult@votg.local',
      passwordHash,
      role: 'SAGE',
      profile: {
        create: {
          displayName: 'Adult Sage',
          bio: 'An adult user who can access NSFW content.',
          dateOfBirth: yearsAgo(25),
        }
      }
    }
  })
  console.log(`Created adult (25): ${adultUser.username}`)

  // ── Under-18 users ──
  const teen16 = await prisma.user.create({
    data: {
      username: 'teen_sixteen',
      email: 'teen16@votg.local',
      passwordHash,
      role: 'HELPSEEKER',
      profile: {
        create: {
          displayName: 'Teen 16',
          bio: 'A 16-year-old user. Should not see/post/join NSFW content.',
          dateOfBirth: yearsAgo(16),
        }
      }
    }
  })
  console.log(`Created under-18 (16): ${teen16.username}`)

  const teen17 = await prisma.user.create({
    data: {
      username: 'teen_seventeen',
      email: 'teen17@votg.local',
      passwordHash,
      role: 'HELPSEEKER',
      profile: {
        create: {
          displayName: 'Teen 17',
          bio: 'A 17-year-old user. Also restricted from NSFW.',
          dateOfBirth: yearsAgo(17),
        }
      }
    }
  })
  console.log(`Created under-18 (17): ${teen17.username}`)

  // ── Sample community ──
  const community = await prisma.community.create({
    data: {
      name: 'Mental Health Support',
      description: 'A safe space for discussing mental health and wellness.',
      rules: 'Be kind, no hate speech, no medical advice.',
      visibility: 'PUBLIC',
      contentRating: 'SFW',
      adminId: adminUser.id,
      members: {
        create: { userId: adminUser.id, role: 'ADMIN' }
      }
    }
  })
  console.log(`Created community: ${community.name}`)

  // ── Sample NSFW community ──
  const nsfwCommunity = await prisma.community.create({
    data: {
      name: 'Vent Freely (NSFW)',
      description: 'An uncensored space for adults to vent freely.',
      rules: '18+ only. No hate speech.',
      visibility: 'PUBLIC',
      contentRating: 'NSFW',
      adminId: adultUser.id,
      members: {
        create: { userId: adultUser.id, role: 'ADMIN' }
      }
    }
  })
  console.log(`Created NSFW community: ${nsfwCommunity.name}`)

  // ── Sample posts ──
  await prisma.post.create({
    data: {
      userId: adultUser.id,
      title: 'Having a rough day',
      body: 'Just need to vent. Work has been stressful and I feel overwhelmed.',
      category: 'MENTAL_HEALTH',
      emotion: 'SAD',
      isUncensored: false,
    }
  })

  await prisma.post.create({
    data: {
      userId: adminUser.id,
      title: 'NSFW — Trigger warning',
      body: 'This post contains adult themes and is marked NSFW.',
      category: 'VENT',
      emotion: 'ANGRY',
      isUncensored: true,
    }
  })

  await prisma.post.create({
    data: {
      userId: teen16.id,
      title: 'Feeling lonely today',
      body: 'I wish I had more friends to talk to.',
      category: 'LONELINESS_AND_LEFT_OUT',
      emotion: 'SAD',
      isUncensored: false,
    }
  })

  const allUsers = [adminUser, adultUser, teen16, teen17]

  // ── 30 additional users ──
  const users30 = [
    { username: 'sage_anna',     email: 'anna@votg.local',     role: 'SAGE',       displayName: 'Anna Sage',        age: 28, bio: 'Life coach and listener.' },
    { username: 'sage_ray',      email: 'ray@votg.local',      role: 'SAGE',       displayName: 'Ray of Hope',      age: 35, bio: 'Here to support anyone in need.' },
    { username: 'sage_luna',     email: 'luna@votg.local',     role: 'SAGE',       displayName: 'Luna Moon',        age: 31, bio: 'Mental health advocate.' },
    { username: 'sage_marcus',   email: 'marcus@votg.local',   role: 'SAGE',       displayName: 'Marcus Strong',    age: 42, bio: 'Been through it all, happy to help.' },
    { username: 'helper_elena',  email: 'elena@votg.local',    role: 'BOTH',       displayName: 'Elena Helper',     age: 24, bio: 'I give and receive support.' },
    { username: 'helper_jay',    email: 'jay@votg.local',      role: 'BOTH',       displayName: 'Jay Both',         age: 29, bio: 'We heal together.' },
    { username: 'seeker_oliver', email: 'oliver@votg.local',   role: 'HELPSEEKER', displayName: 'Oliver Needs Help', age: 19, bio: 'Looking for guidance.' },
    { username: 'seeker_emma',   email: 'emma@votg.local',     role: 'HELPSEEKER', displayName: 'Emma Anxious',      age: 22, bio: 'Dealing with anxiety.' },
    { username: 'seeker_noah',   email: 'noah@votg.local',     role: 'HELPSEEKER', displayName: 'Noah Quiet',        age: 20, bio: 'I just need someone to talk to.' },
    { username: 'seeker_amelia', email: 'amelia@votg.local',   role: 'HELPSEEKER', displayName: 'Amelia Sad',         age: 21, bio: 'Going through a tough breakup.' },
    { username: 'seeker_liam',   email: 'liam@votg.local',     role: 'HELPSEEKER', displayName: 'Liam Lonely',       age: 18, bio: 'Feeling isolated.' },
    { username: 'seeker_mia',    email: 'mia@votg.local',      role: 'HELPSEEKER', displayName: 'Mia Overwhelmed',    age: 23, bio: 'Stress is eating me alive.' },
    { username: 'teen_alex',     email: 'alex@votg.local',     role: 'HELPSEEKER', displayName: 'Alex Teen',          age: 15, bio: 'Teen struggling with school.' },
    { username: 'teen_bella',    email: 'bella@votg.local',    role: 'HELPSEEKER', displayName: 'Bella Blue',         age: 14, bio: 'Bullied at school.' },
    { username: 'teen_charlie',  email: 'charlie@votg.local',  role: 'HELPSEEKER', displayName: 'Charlie Brave',      age: 16, bio: 'Questioning everything.' },
    { username: 'sage_priya',    email: 'priya@votg.local',    role: 'SAGE',       displayName: 'Priya Wisdom',      age: 37, bio: 'Certified counselor volunteering here.' },
    { username: 'seeker_zara',   email: 'zara@votg.local',     role: 'HELPSEEKER', displayName: 'Zara Hopeful',      age: 26, bio: 'Trying to stay positive.' },
    { username: 'helper_leo',    email: 'leo@votg.local',      role: 'BOTH',       displayName: 'Leo Listener',      age: 33, bio: 'We all need each other.' },
    { username: 'seeker_hannah', email: 'hannah@votg.local',   role: 'HELPSEEKER', displayName: 'Hannah Hurt',       age: 17, bio: 'Self-harm survivor, looking for support.' },
    { username: 'sage_david',    email: 'david@votg.local',    role: 'SAGE',       displayName: 'David Calm',        age: 45, bio: 'Twenty years of peer support experience.' },
    { username: 'sage_clara',    email: 'clara@votg.local',    role: 'SAGE',       displayName: 'Clara Compassion',  age: 34, bio: 'Empathy is my superpower.' },
    { username: 'seeker_ethan',  email: 'ethan@votg.local',    role: 'HELPSEEKER', displayName: 'Ethan Lost',        age: 19, bio: 'Just lost my job and need support.' },
    { username: 'sage_grace',    email: 'grace@votg.local',    role: 'SAGE',       displayName: 'Grace Peace',       age: 39, bio: 'Mindfulness coach and listener.' },
    { username: 'helper_owen',   email: 'owen@votg.local',     role: 'BOTH',       displayName: 'Owen Open',         age: 27, bio: 'We grow through what we go through.' },
    { username: 'seeker_ava',    email: 'ava@votg.local',      role: 'HELPSEEKER', displayName: 'Ava Anxious',        age: 20, bio: 'Panic attacks are ruining my life.' },
    { username: 'sage_liam',     email: 'sage_liam@votg.local', role: 'SAGE',      displayName: 'Liam Wise',         age: 41, bio: 'Recovering addict, here to help.' },
    { username: 'seeker_ella',   email: 'ella@votg.local',     role: 'HELPSEEKER', displayName: 'Ella Alone',         age: 16, bio: 'My parents dont understand me.' },
    { username: 'helper_maya',   email: 'maya@votg.local',     role: 'BOTH',       displayName: 'Maya Balance',      age: 30, bio: 'Therapist by day, human by night.' },
    { username: 'seeker_jack',   email: 'jack@votg.local',     role: 'HELPSEEKER', displayName: 'Jack Struggling',    age: 25, bio: 'Divorce is harder than I thought.' },
    { username: 'sage_nina',     email: 'nina@votg.local',     role: 'SAGE',       displayName: 'Nina Nurture',      age: 36, bio: 'Social worker here to listen.' },
  ]

  const createdUsers = []
  for (const u of users30) {
    const user = await prisma.user.create({
      data: {
        username: u.username,
        email: u.email,
        passwordHash,
        role: u.role,
        profile: {
          create: {
            displayName: u.displayName,
            bio: u.bio,
            dateOfBirth: yearsAgo(u.age),
          }
        }
      }
    })
    createdUsers.push(user)
  }
  allUsers.push(...createdUsers)
  console.log('Created 30 additional users')

  // ── Follow relationships ──
  const follows = [
    [adminUser, adultUser], [adminUser, 'sage_anna'], [adminUser, 'sage_ray'], [adminUser, 'sage_luna'],
    [adultUser, adminUser], [adultUser, 'sage_marcus'], [adultUser, 'helper_elena'],
    ['sage_anna', 'sage_luna'], ['sage_anna', 'sage_ray'], ['sage_anna', 'sage_priya'],
    ['sage_ray', 'sage_anna'], ['sage_ray', 'helper_jay'],
    ['helper_elena', 'sage_anna'], ['helper_elena', 'sage_ray'], ['helper_elena', 'seeker_oliver'], ['helper_elena', 'seeker_emma'],
    ['helper_jay', 'sage_marcus'], ['helper_jay', 'sage_priya'],
    ['seeker_oliver', 'sage_anna'], ['seeker_oliver', 'sage_ray'],
    ['seeker_emma', 'sage_luna'], ['seeker_emma', 'sage_anna'],
    ['seeker_noah', 'sage_david'], ['seeker_noah', 'helper_elena'],
    ['seeker_amelia', 'sage_ray'], ['seeker_amelia', 'sage_luna'],
    ['seeker_mia', 'sage_priya'], ['seeker_mia', 'sage_anna'],
    ['sage_priya', 'sage_david'], ['sage_priya', 'helper_leo'],
    ['seeker_zara', 'sage_anna'], ['seeker_zara', 'sage_clara'],
    ['helper_leo', 'sage_grace'], ['helper_leo', 'sage_nina'],
    ['seeker_hannah', 'sage_priya'], ['seeker_hannah', 'sage_clara'],
    ['sage_david', 'sage_priya'], ['sage_david', 'helper_maya'],
    ['sage_clara', 'sage_grace'], ['sage_clara', 'sage_nina'],
    ['seeker_ethan', 'sage_david'], ['seeker_ethan', 'sage_clara'],
    ['sage_grace', 'sage_nina'], ['sage_grace', 'helper_maya'],
    ['helper_owen', 'sage_anna'], ['helper_owen', 'sage_ray'], ['helper_owen', 'sage_grace'],
    ['seeker_ava', 'sage_clara'], ['seeker_ava', 'sage_luna'],
    ['sage_liam', 'sage_david'], ['sage_liam', 'sage_priya'],
    ['helper_maya', 'sage_grace'], ['helper_maya', 'sage_nina'],
    ['seeker_jack', 'sage_david'], ['seeker_jack', 'sage_liam'],
    ['sage_nina', 'sage_clara'], ['sage_nina', 'sage_grace'],
  ]

  for (const [follower, following] of follows) {
    const followerId = typeof follower === 'string' ? allUsers.find(u => u.username === follower)?.id : follower.id
    const followingId = typeof following === 'string' ? allUsers.find(u => u.username === following)?.id : following.id
    if (followerId && followingId && followerId !== followingId) {
      await prisma.follow.create({
        data: { followerId, followingId }
      }).catch(() => {})
    }
  }
  console.log(`Created ${follows.length} follow relationships`)

  console.log('Created sample posts')
  console.log('')
  console.log('── Test credentials (password: password123) ──')
  console.log('  admin_demo     (30, admin)')
  console.log('  adult_user     (25, adult)')
  console.log('  teen_sixteen   (16, under-18)')
  console.log('  teen_seventeen (17, under-18)')
  for (const u of users30) {
    console.log(`  ${u.username.padEnd(15)} (${u.age}, ${u.role.toLowerCase()})`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })