// Sample data seeder for MiniShop
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Product = require('./models/Product');

// Sample users data
const sampleUsers = [
    {
        username: 'admin',
        email: 'admin@minishop.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'user123',
        role: 'user'
    },
    {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'user123',
        role: 'user'
    }
];

// Sample products data
const sampleProducts = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 199.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
        stock: 50,
        featured: true
    },
    {
        name: 'Smart Watch Series 5',
        description: 'Advanced smartwatch with fitness tracking, GPS, and heart rate monitoring.',
        price: 399.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
        stock: 30,
        featured: true
    },
    {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt available in multiple colors and sizes.',
        price: 24.99,
        category: 'clothing',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
        stock: 100,
        featured: false
    },
    {
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans with a comfortable fit and modern style.',
        price: 79.99,
        category: 'clothing',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=200&fit=crop',
        stock: 75,
        featured: false
    },
    {
        name: 'JavaScript: The Complete Guide',
        description: 'Comprehensive guide to JavaScript programming from beginner to advanced level.',
        price: 49.99,
        category: 'books',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop',
        stock: 25,
        featured: true
    },
    {
        name: 'Python Programming Cookbook',
        description: 'Collection of practical Python programming recipes and techniques.',
        price: 39.99,
        category: 'books',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
        stock: 20,
        featured: false
    },
    {
        name: 'Coffee Maker Deluxe',
        description: 'Automatic coffee maker with programmable settings and thermal carafe.',
        price: 149.99,
        category: 'home',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
        stock: 40,
        featured: false
    },
    {
        name: 'Blender Pro 1000W',
        description: 'High-powered blender perfect for smoothies, soups, and food preparation.',
        price: 129.99,
        category: 'home',
        image: 'https://images.unsplash.com/photo-1585515656519-5c5b4c9d7b8a?w=300&h=200&fit=crop',
        stock: 35,
        featured: false
    },
    {
        name: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat with excellent grip and cushioning for all yoga practices.',
        price: 59.99,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
        stock: 60,
        featured: false
    },
    {
        name: 'Running Shoes Air Max',
        description: 'Comfortable running shoes with advanced cushioning and breathable material.',
        price: 119.99,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
        stock: 45,
        featured: true
    },
    {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking and long battery life.',
        price: 34.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop',
        stock: 80,
        featured: false
    },
    {
        name: 'Gaming Keyboard RGB',
        description: 'Mechanical gaming keyboard with RGB lighting and programmable keys.',
        price: 89.99,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=200&fit=crop',
        stock: 25,
        featured: false
    }
];

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Clear existing data
// async function clearData() {
//     try {
//         await User.deleteMany({});
//         await Product.deleteMany({});
//         console.log('🗑️  Cleared existing data');
//     } catch (error) {
//         console.error('Error clearing data:', error);
//     }
// }

// Seed users
async function seedUsers() {
    try {
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save(); // This will trigger the pre-save hook
        }
        
        console.log('👥 Seeded users');
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

// Seed products
async function seedProducts() {
    try {
        const products = [];
        
        for (const productData of sampleProducts) {
            const product = new Product(productData);
            products.push(product);
        }
        
        await Product.insertMany(products);
        console.log('📦 Seeded products');
    } catch (error) {
        console.error('Error seeding products:', error);
    }
}

// Main seed function
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        await connectDB();
        await clearData();
        await seedUsers();
        await seedProducts();
        
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📋 Sample Data Created:');
        console.log('👤 Admin User: admin@minishop.com / admin123');
        console.log('👤 Regular Users: john@example.com / user123, jane@example.com / user123');
        console.log('📦 Products: 12 sample products across different categories');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
