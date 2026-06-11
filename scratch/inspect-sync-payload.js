const fs = require('fs');

const content = fs.readFileSync('/Users/lukasbruckmeyer/.gemini/antigravity/brain/2ad13f69-3e0b-4fbf-af81-dfc772eb8438/.system_generated/steps/8110/content.md', 'utf8');

// The file might contain headers, so let's extract the JSON block.
const jsonStart = content.indexOf('{"works":');
if (jsonStart === -1) {
  console.log("Could not find JSON block in file.");
  process.exit(1);
}

const jsonStr = content.substring(jsonStart).trim();
const data = JSON.parse(jsonStr);

console.log("Total works in sync response:", data.works.length);

const zweisame = data.works.find(w => w.sku === 'DTN-0028');
if (zweisame) {
  console.log("FOUND ZWEISAME WEIHNACHT IN SYNC RESPONSE!");
  console.log("Keys on Zweisame:", Object.keys(zweisame));
  console.log("Zweisame properties:", {
    id: zweisame.id,
    title: zweisame.title,
    sku: zweisame.sku,
    parent_id: zweisame.parent_id,
    publish_to_shop: zweisame.publish_to_shop,
    deleted_at: zweisame.deleted_at
  });
} else {
  console.log("Zweisame Weihnacht (DTN-0028) NOT FOUND in sync response.");
}

const variants = data.works.filter(w => w.parent_id === 'b97a829c-1578-42bc-bd51-7da7628340a0' || (w.sku && w.sku.includes('DTN-0028-')));
console.log("Variants found in response:", variants.map(v => ({ id: v.id, title: v.title, sku: v.sku, parent_id: v.parent_id })));
