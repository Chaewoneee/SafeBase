import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { generateAllSeedData } from '../src/lib/seed-data';

// Load .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key로 변경하여 RLS 우회

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌱 Starting Supabase seed process...');

  const { games, transactions, reports, blacklist, detectionRules } = generateAllSeedData();

  // Mappings for IDs to UUIDs
  const gameIdMap = new Map<string, string>();
  const txIdMap = new Map<string, string>();

  // 1. Insert Games
  console.log(`Inserting ${games.length} games...`);
  const gamesToInsert = games.map(g => {
    const newId = uuidv4();
    gameIdMap.set(g.id, newId);
    return {
      id: newId,
      home_team: g.home_team,
      away_team: g.away_team,
      stadium: g.stadium,
      game_date: g.game_date,
      is_soldout: g.is_soldout
    };
  });
  
  const { error: gameErr } = await supabase.from('games').insert(gamesToInsert);
  if (gameErr) { console.error('Error inserting games:', gameErr); return; }
  console.log('✅ Games inserted');

  // 2. Insert Transactions
  console.log(`Inserting ${transactions.length} transactions...`);
  const chunkSize = 100;
  for (let i = 0; i < transactions.length; i += chunkSize) {
    const chunk = transactions.slice(i, i + chunkSize);
    const txsToInsert = chunk.map(tx => {
      const newId = uuidv4();
      txIdMap.set(tx.id, newId);
      return {
        id: newId,
        account_id: tx.account_id,
        game_id: gameIdMap.get(tx.game_id)!,
        team: tx.team,
        seat_info: tx.seat_info,
        original_price: tx.original_price,
        resale_price: tx.resale_price,
        transaction_type: tx.transaction_type,
        quantity: tx.quantity,
        source_platform: tx.source_platform,
        listing_url: tx.listing_url,
        risk_score: tx.risk_score,
        risk_level: tx.risk_level,
        flagged_rules: tx.flagged_rules,
        status: tx.status,
        admin_note: tx.admin_note,
        ip_address: tx.ip_address,
        created_at: tx.created_at
      };
    });

    const { error: txErr } = await supabase.from('transactions').insert(txsToInsert);
    if (txErr) { console.error('Error inserting transactions:', txErr); return; }
  }
  console.log('✅ Transactions inserted');

  // 3. Insert Reports
  console.log(`Inserting ${reports.length} reports...`);
  const reportsToInsert = reports.map(r => ({
    id: uuidv4(),
    transaction_id: r.transaction_id ? txIdMap.get(r.transaction_id) : null,
    reporter_name: r.reporter_name,
    description: r.description,
    evidence_url: r.evidence_url,
    status: r.status,
    admin_note: r.admin_note,
    created_at: r.created_at,
    resolved_at: r.resolved_at
  }));
  const { error: repErr } = await supabase.from('reports').insert(reportsToInsert);
  if (repErr) { console.error('Error inserting reports:', repErr); return; }
  console.log('✅ Reports inserted');

  // 4. Insert Blacklist
  console.log(`Inserting ${blacklist.length} blacklist entries...`);
  const blacklistToInsert = blacklist.map(b => ({
    id: uuidv4(),
    account_id: b.account_id,
    reason: b.reason,
    level: b.level,
    related_transactions: b.related_transactions.map(tid => txIdMap.get(tid)).filter(Boolean),
    created_at: b.created_at,
    expires_at: b.expires_at
  }));
  const { error: blErr } = await supabase.from('blacklist').insert(blacklistToInsert);
  if (blErr) { console.error('Error inserting blacklist:', blErr); return; }
  console.log('✅ Blacklist inserted');

  // 5. Insert Detection Rules
  console.log(`Inserting ${detectionRules.length} rules...`);
  const rulesToInsert = detectionRules.map(r => ({
    id: uuidv4(),
    name: r.name,
    type: r.type,
    description: r.description,
    threshold: r.threshold,
    weight: r.weight,
    is_active: r.is_active,
    updated_at: r.updated_at
  }));
  const { error: ruleErr } = await supabase.from('detection_rules').insert(rulesToInsert);
  if (ruleErr) { console.error('Error inserting rules:', ruleErr); return; }
  console.log('✅ Rules inserted');

  console.log('🎉 Seed completed successfully!');
}

main().catch(console.error);
