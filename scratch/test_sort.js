const db = require('../backend/db');
const FamilyService = require('../backend/services/familyService');

async function testSort() {
  try {
    const user = { isAdmin: true };
    const result = await FamilyService.getActiveFamilies(1, 10, '', user);
    console.log('Sorted Families:');
    result.families.forEach(f => console.log(f.head_name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testSort();
