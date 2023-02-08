//getServerSideProps in Next13
import { use } from "react"

async function getData(input:string) { // no-store = SSR, force-cache = SSG, next:{revalidate:20} = ISR
	return await (await fetch(`https://world.openfoodfacts.org/api/v2/search?brand=carrefour&categories_tags_fr=${input}&fields=code,product_name,image_url`, { cache: "no-store" })).json();
}

export default function Serverpage() {
	const data = use(getData("lait"));

	return (
		<div>
			<h2>Server Fetching</h2>
			{data?.products?.map((_data:any) => {
				return (
					<ul key={_data.code}>
						<li>{_data.product_name}</li>
					</ul>
				)
			})}
		</div>
	)
}
