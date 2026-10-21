// Read-only fixtures for the isolated menu-book demo; no real menu records are modified.
const pilot='rf-demo-restaurant-01';
const drinks=[
 ['cola','Cola · 330 ml',12000,'Gazli ichimliklar','drink-soda.svg'],
 ['lemonade','Gazli limonad · 330 ml',14000,'Gazli ichimliklar','drink-soda.svg'],
 ['orange','Apelsin sharbati · 250 ml',18000,'Sharbatlar','drink-juice.svg'],
 ['apple','Olma sharbati · 250 ml',16000,'Sharbatlar','drink-juice.svg'],
 ['water','Ichimlik suvi · 500 ml',6000,'Gazsiz ichimliklar','drink-water.svg'],
] as const;
export function withDemoDrinks(restaurants:any[],menu:any[]){
 if(!restaurants.some(r=>r.id===pilot&&r.is_demo))return menu;
 const additions=drinks.filter(([code,name])=>!menu.some(m=>m.restaurant_id===pilot&&(m.id==='rf-demo-book-drink-'+code||m.name===name))).map(([code,name,price,category,image])=>({id:'rf-demo-book-drink-'+code,restaurant_id:pilot,name,price,category,image_url:'/demo-assets/'+image,description:'DEMO · Ichimlik namunasi. Haqiqiy buyurtma emas.',ingredients:'DEMO',allergens:'DEMO — tarkibni restorandan aniqlashtiring.',available:1,is_demo:1}));
 return [...menu,...additions];
}
