import 'dotenv/config';
import app from './app.js';
import { seedDemoUser } from './services/store.js';

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, async () => {
  console.log(`\n  Eleftheros API running on http://localhost:${PORT}`);
  console.log(`  myDATA mode: ${process.env.MYDATA_MOCK === 'true' ? 'MOCK' : 'LIVE'}`);
  if (process.env.NODE_ENV !== 'production') await seedDemoUser();
  console.log();
});
