import { useLoaderData } from 'react-router-dom';
import { getMenu } from '../../services/apiRestaurant';
import MenuItem from './MenuItem';


export async function loader() {
  const menu = await getMenu();
  return menu;
}

function Menu() {
  const menu = useLoaderData(); // برای اینکه صفحه و عکس های منو کامل لود شد بعدش نمایش داده بشه کامپوننت 

  console.log(menu);

  return (
   <ul className="divide-y divide-stone-200 px-2">
  {menu.map((pizza) => {
    return <MenuItem pizza={pizza} key={pizza.id} />;
  })}
</ul>

  );
}


export default Menu;
