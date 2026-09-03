const User = require('../models/User.model');
const Brand = require('../models/Brand.model');
const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const Outlet = require('../models/Outlet.model');

async function autoSeed() {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('ℹ️ Database already has data. Skipping auto-seed.');
            return;
        }

        console.log('🌱 Database is empty. Seeding initial data...');

        // 1. Create Admins and Retail Outlets
        const admin1 = await User.create({
            name: 'Admin One',
            email: 'admin1@shopsmart.com',
            password: 'Admin@1234',
            role: 'admin',
            isActive: true,
        });

        const store1User = await User.create({
            name: 'Retail Store 1',
            email: 'store1@shopsmart.com',
            password: 'Store@123',
            role: 'retailOutlet',
            phone: '9876543210',
            isActive: true,
        });

        const storeOutlet = await Outlet.create({
            name: 'Main Retail Store',
            ownerUserId: store1User._id,
            phone: '9876543210',
            email: 'store1@shopsmart.com',
            address: {
                street: '123 Main Street',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560001',
                country: 'India',
            },
            status: 'active',
        });

        store1User.outletId = storeOutlet._id;
        await store1User.save();

        // 2. Create Brands
        const brandDefs = [
            { name: 'SSR', slug: 'ssr', description: 'SSR brand products', isActive: true },
            { name: 'JayaJanardhana', slug: 'jayajanardhana', description: 'JayaJanardhana (JJR) brand products', isActive: true },
            { name: 'MilletsPro', slug: 'milletspro', description: 'MilletsPro brand products', isActive: true },
        ];

        const brandMap = {};
        for (const bDef of brandDefs) {
            const brand = await Brand.create(bDef);
            brandMap[bDef.slug] = brand._id;
        }

        // 3. Create Categories
        const categoryDefs = [
            { name: 'Rice Varieties', slug: 'ssr-rice-varieties', brandSlug: 'ssr' },
            { name: 'Pulses & Lentils', slug: 'ssr-pulses-lentils', brandSlug: 'ssr' },
            { name: 'Flour & Grains', slug: 'jjr-flour-grains', brandSlug: 'jayajanardhana' },
            { name: 'Millet Flour', slug: 'mp-millet-flour', brandSlug: 'milletspro' },
        ];

        const catMap = {};
        for (const cDef of categoryDefs) {
            const cat = await Category.create({
                name: cDef.name,
                slug: cDef.slug,
                brandId: brandMap[cDef.brandSlug],
                isActive: true,
            });
            catMap[cDef.slug] = cat._id;
        }

        // 4. Create Sample Products
        const sampleProducts = [
            {
                name: 'SSR Sona Masoori Rice (10kg)',
                slug: 'ssr-sona-masoori-rice-10kg',
                sku: 'SSR-RICE-001',
                brandId: brandMap['ssr'],
                categoryId: catMap['ssr-rice-varieties'],
                originalPrice: 550,
                discountPercentage: 10,
                discountedPrice: 495,
                stock: 100,
                unit: 'kg',
                isActive: true,
                description: 'Premium quality Sona Masoori Rice',
            },
            {
                name: 'SSR Toor Dal Premium (1kg)',
                slug: 'ssr-toor-dal-premium-1kg',
                sku: 'SSR-DAL-001',
                brandId: brandMap['ssr'],
                categoryId: catMap['ssr-pulses-lentils'],
                originalPrice: 140,
                discountPercentage: 10,
                discountedPrice: 126,
                stock: 250,
                unit: 'kg',
                isActive: true,
                description: 'High quality unpolished Toor Dal',
            },
            {
                name: 'JayaJanardhana Whole Wheat Atta (5kg)',
                slug: 'jayajanardhana-whole-wheat-atta-5kg',
                sku: 'JJR-ATTA-001',
                brandId: brandMap['jayajanardhana'],
                categoryId: catMap['jjr-flour-grains'],
                originalPrice: 280,
                discountPercentage: 5,
                discountedPrice: 266,
                stock: 150,
                unit: 'kg',
                isActive: true,
                description: '100% Whole Wheat Chakki Fresh Atta',
            },
            {
                name: 'MilletsPro Organic Foxtail Millet (1kg)',
                slug: 'milletspro-organic-foxtail-millet-1kg',
                sku: 'MP-FOX-001',
                brandId: brandMap['milletspro'],
                categoryId: catMap['mp-millet-flour'],
                originalPrice: 120,
                discountPercentage: 8,
                discountedPrice: 110,
                stock: 80,
                unit: 'kg',
                isActive: true,
                description: 'Healthy and organic Foxtail Millet',
            },
        ];

        for (const p of sampleProducts) {
            await Product.create(p);
        }

        console.log('🎉 Auto-seeding completed successfully!');
        console.log('🔑 Admin login: admin1@shopsmart.com / Admin@1234');
        console.log('🔑 Store login: store1@shopsmart.com / Store@123');
    } catch (err) {
        console.error('❌ Auto-seed failed:', err.message);
    }
}

module.exports = autoSeed;
