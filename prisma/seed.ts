import { PrismaClient, UserRole, EntryStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 管理者ユーザーの作成
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: '管理者',
      role: UserRole.ADMIN
    }
  })

  // 一般ユーザーの作成（3人）
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@test.com' },
      update: {},
      create: {
        email: 'user1@test.com',
        name: '一般ユーザー1',
        role: UserRole.USER
      }
    }),
    prisma.user.upsert({
      where: { email: 'user2@test.com' },
      update: {},
      create: {
        email: 'user2@test.com',
        name: '一般ユーザー2',
        role: UserRole.USER
      }
    }),
    prisma.user.upsert({
      where: { email: 'user3@test.com' },
      update: {},
      create: {
        email: 'user3@test.com',
        name: '一般ユーザー3',
        role: UserRole.USER
      }
    })
  ])

  // スキルの作成（5つ）
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript' }
    }),
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React' }
    }),
    prisma.skill.upsert({
      where: { name: 'Next.js' },
      update: {},
      create: { name: 'Next.js' }
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js' }
    }),
    prisma.skill.upsert({
      where: { name: 'PostgreSQL' },
      update: {},
      create: { name: 'PostgreSQL' }
    })
  ])

  // プロジェクトの作成（3つ）
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'フルスタック開発案件',
        description:
          'TypeScript、React、Next.jsを使用したWebアプリケーション開発。バックエンドはNode.js、データベースはPostgreSQLを使用。',
        publishedAt: new Date(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        unitPrice: 100000,
        createdBy: admin.id,
        skills: {
          create: skills.map((skill) => ({
            skillId: skill.id
          }))
        }
      }
    }),
    prisma.project.create({
      data: {
        title: 'フロントエンド開発案件',
        description:
          'React、Next.jsを使用したSPA開発。TypeScriptで型安全な開発を行います。',
        publishedAt: new Date(),
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20日後
        unitPrice: 80000,
        createdBy: admin.id,
        skills: {
          create: skills.slice(0, 3).map((skill) => ({
            skillId: skill.id
          }))
        }
      }
    }),
    prisma.project.create({
      data: {
        title: 'バックエンド開発案件',
        description:
          'Node.js、PostgreSQLを使用したAPI開発。RESTful APIの設計と実装を行います。',
        publishedAt: new Date(),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25日後
        unitPrice: 90000,
        createdBy: admin.id,
        skills: {
          create: skills.slice(3).map((skill) => ({
            skillId: skill.id
          }))
        }
      }
    })
  ])

  // エントリーの作成（各プロジェクトに最低1人ずつ応募）
  const entries = await Promise.all([
    // プロジェクト1への応募（全員）
    ...users.map((user) =>
      prisma.entry.create({
        data: {
          userId: user.id,
          projectId: projects[0].id,
          status: EntryStatus.APPLIED,
          appliedAt: new Date()
        }
      })
    ),
    // プロジェクト2への応募（2人）
    ...users.slice(0, 2).map((user) =>
      prisma.entry.create({
        data: {
          userId: user.id,
          projectId: projects[1].id,
          status: EntryStatus.APPLIED,
          appliedAt: new Date()
        }
      })
    ),
    // プロジェクト3への応募（1人）
    prisma.entry.create({
      data: {
        userId: users[0].id,
        projectId: projects[2].id,
        status: EntryStatus.APPLIED,
        appliedAt: new Date()
      }
    })
  ])

  console.log('シードデータの作成が完了しました')
  console.log({
    admin: { id: admin.id, email: admin.email, role: admin.role },
    users: users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    skills: skills.map((s) => ({ id: s.id, name: s.name })),
    projects: projects.map((p) => ({ id: p.id, title: p.title })),
    entries: entries.map((e) => ({
      userId: e.userId,
      projectId: e.projectId,
      status: e.status
    }))
  })
}

main()
  .catch((e) => {
    console.error('シードデータの作成中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
