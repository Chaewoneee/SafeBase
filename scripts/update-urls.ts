import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { generateAllSeedData } from '../src/lib/seed-data';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase keys');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔄 Fetching all transactions...');
  const { data: txs, error: fetchErr } = await supabase.from('transactions').select('id, source_platform');
  
  if (fetchErr || !txs) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  console.log(`Updating ${txs.length} transactions with listing URLs...`);
  
  // Update in chunks to avoid overwhelming the API
  const chunkSize = 50;
  for (let i = 0; i < txs.length; i += chunkSize) {
    const chunk = txs.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (tx) => {
      const randomItemId = Math.floor(Math.random() * 100000000);
      let listing_url = '';
      if (tx.source_platform === '중고나라') listing_url = `https://cafe.naver.com/joonggonara/${randomItemId}`;
      else if (tx.source_platform === '번개장터') listing_url = `https://m.bunjang.co.kr/products/${randomItemId}`;
      else listing_url = `https://www.daangn.com/articles/${randomItemId}`;

      return supabase.from('transactions').update({ listing_url }).eq('id', tx.id);
    }));
    console.log(`...updated ${Math.min(i + chunkSize, txs.length)} / ${txs.length}`);
  }

  console.log('✅ Update complete!');
}

main().catch(console.error);
