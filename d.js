const bject = {};
async function dd() {
  const req = await fetch("./js/sww.json");
  (await req.json()).response.forEach((ele) => {
    bject[ele.league.id] = ele.league.type;
    console.log(ele);
  });
  console.log(bject);
}
dd();

bject;
