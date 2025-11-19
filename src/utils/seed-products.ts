// Script para popular produtos iniciais no banco de dados
// Execute esta função uma vez para adicionar os produtos

import { createProduct } from './api';

export async function seedProducts() {
  const initialProducts = [
    {
      name: 'Moletom Oversized Black',
      price: 299.90,
      image: 'https://images.unsplash.com/photo-1711387718409-a05f62a3dc39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwaG9vZGllfGVufDF8fHx8MTc2MzQ2NzMwMHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Moletons',
      gender: 'Unissex',
      sizes: ['P', 'M', 'G', 'GG'],
      supplier_link: 'https://pt.shein.com/example',
      supplier_cost: 150.00,
    },
    {
      name: 'Camiseta Oversized Gola Alta Masculina',
      price: 109.90,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwdHNoaXJ0fGVufDF8fHx8MTc2MzQ2NzMwMHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Camisetas',
      gender: 'Masculino',
      sizes: ['P', 'M', 'G', 'GG'],
      supplier_link: 'https://pt.shein.com/example',
      supplier_cost: 50.00,
    },
  ];

  console.log('🌱 Adicionando produtos iniciais...');

  for (const product of initialProducts) {
    try {
      const created = await createProduct(product);
      console.log(`✅ Produto criado: ${created.name} (ID: ${created.id})`);
    } catch (error) {
      console.error(`❌ Erro ao criar produto ${product.name}:`, error);
    }
  }

  console.log('✨ Produtos iniciais adicionados!');
}

// Instruções:
// 1. Abra o console do navegador (F12)
// 2. Cole o seguinte código:
//
// import { seedProducts } from './utils/seed-products';
// seedProducts();
//
// 3. Os produtos serão adicionados ao banco de dados
