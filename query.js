const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const settings = await prisma.shopSetting.findMany()
  console.log(settings)
}
main()
