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

  console.log('Created sample posts')
  console.log('')
  console.log('── Test credentials (password: password123) ──')
  console.log('  admin_demo     (30, admin)')
  console.log('  adult_user     (25, adult)')
  console.log('  teen_sixteen   (16, under-18)')
  console.log('  teen_seventeen (17, under-18)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })