// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  try {
    // UPI Config
    try {
      await prisma.upiConfig.deleteMany()
      await prisma.upiConfig.create({
        data: { upiId: 'tableserve@upi', merchantName: 'TableServe Cafe' }
      })
      console.log('✅ UPI Config seeded')
    } catch (e) {
      console.log('⚠️  UPI Config seed skipped:', e.code)
    }

    // Staff
    try {
      await prisma.staff.deleteMany()
      const adminHash = await bcrypt.hash('admin123', 10)
      const staffHash = await bcrypt.hash('staff123', 10)

      await prisma.staff.createMany({
        data: [
          { name: 'Admin User', email: 'admin@tableserve.com', passwordHash: adminHash, role: 'ADMIN', pin: '0000' },
          { name: 'Staff One', email: 'staff1@tableserve.com', passwordHash: staffHash, role: 'STAFF', pin: '1111', phone: '9876543210' },
          { name: 'Manager Sam', email: 'manager@tableserve.com', passwordHash: staffHash, role: 'MANAGER', pin: '2222', phone: '9876543211' },
        ]
      })
      console.log('✅ Staff seeded')
    } catch (e) {
      console.log('⚠️  Staff seed skipped:', e.code)
    }

    // Tables
    try {
      await prisma.table.deleteMany()
      await prisma.table.createMany({
        data: [
          { number: 1, capacity: 2, locationLabel: 'Window Side' },
          { number: 2, capacity: 4, locationLabel: 'Window Side' },
          { number: 3, capacity: 4, locationLabel: 'Center' },
          { number: 4, capacity: 6, locationLabel: 'Center' },
          { number: 5, capacity: 2, locationLabel: 'Outdoor' },
          { number: 6, capacity: 8, locationLabel: 'Private Room' },
        ]
      })
      console.log('✅ Tables seeded')
    } catch (e) {
      console.log('⚠️  Tables seed skipped:', e.code)
    }

    // Categories
    try {
      await prisma.category.deleteMany()
      const [burgers, drinks, sides, desserts] = await Promise.all([
        prisma.category.create({ data: { name: 'Burgers', sortOrder: 1 } }),
        prisma.category.create({ data: { name: 'Drinks', sortOrder: 2 } }),
        prisma.category.create({ data: { name: 'Sides', sortOrder: 3 } }),
        prisma.category.create({ data: { name: 'Desserts', sortOrder: 4 } }),
      ])

      // Menu Items
      await prisma.menuItem.deleteMany()
      await prisma.menuItem.createMany({
        data: [
          { name: 'Classic Veggie Burger', categoryId: burgers.id, description: 'Crispy veggie patty, lettuce, tomato, mayo', price: 149, foodType: 'VEG' },
          { name: 'Spicy Chicken Burger', categoryId: burgers.id, description: 'Grilled spicy chicken, jalapeños, sriracha sauce', price: 189, foodType: 'NON_VEG' },
          { name: 'Double Smash Burger', categoryId: burgers.id, description: 'Double beef patty, cheese, caramelized onions', price: 249, foodType: 'NON_VEG' },
          { name: 'Vegan Mushroom Burger', categoryId: burgers.id, description: 'Portobello mushroom, avocado, vegan sauce', price: 179, foodType: 'VEGAN' },
          { name: 'Cold Coffee', categoryId: drinks.id, description: 'Chilled coffee with milk and ice cream', price: 99, foodType: 'VEG' },
          { name: 'Fresh Lime Soda', categoryId: drinks.id, description: 'Fresh lime with sparkling water and mint', price: 69, foodType: 'VEGAN' },
          { name: 'Masala Fries', categoryId: sides.id, description: 'Crispy fries with Indian spice blend', price: 89, foodType: 'VEGAN' },
          { name: 'Cheese Loaded Fries', categoryId: sides.id, description: 'Golden fries smothered in melted cheese sauce', price: 119, foodType: 'VEG' },
          { name: 'Chocolate Lava Cake', categoryId: desserts.id, description: 'Warm cake with molten chocolate center', price: 129, foodType: 'VEG' },
          { name: 'Mango Sorbet', categoryId: desserts.id, description: 'Fresh mango sorbet, dairy free', price: 99, foodType: 'VEGAN' },
        ]
      })
      console.log('✅ Categories & Menu Items seeded')
    } catch (e) {
      console.log('⚠️  Categories seed skipped:', e.code)
    }

    console.log('✅ Seeding complete!')
    console.log('👤 Admin: admin@tableserve.com / admin123')
    console.log('👤 Staff: staff1@tableserve.com / staff123')
    console.log('👤 Manager: manager@tableserve.com / staff123')
  } catch (e) {
    console.error('Fatal error:', e)
  }
}

main().finally(() => prisma.$disconnect())
