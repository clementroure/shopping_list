"use client"

import useSWR from "swr"
import { useEffect, useState, Fragment } from "react"
import Link from "next/link"
import carrefourLogo from "../public/assets/carrefourLogo.png"
import Image from "next/image"
import { ClockLoader } from "react-spinners"
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { v4 as uuidv4 } from 'uuid';

const fetcher = (input:string) => fetch(`https://world.openfoodfacts.org/api/v2/search?brand=carrefour&categories_tags_fr=${input}&fields=code,product_name,image_url`).then(res => res.json())

export default function Clientpage() {

	const [userId, setUserId] = useState("")

    const [searchInput, setSearchInput] = useState("ananas")
	const [input, setInput] = useState("")

	const [dataList, setDataList] = useState<{name:string, quantity: number, imageUrl: string}[]>([])
	const [list, setList] = useState<{name:string, quantity: number, imageUrl: string}[]>([])
	
	const [quantity, setQuantity] = useState(new Array(24).fill(1))

	// voir panier client
	const [open, setOpen] = useState(false)

	// crash if after error !datafect(() => {
	useEffect(() => {
			const init = async () => {

			const storageList = await JSON.parse(localStorage.getItem('list')!);
			if(storageList != null)
			setList(await JSON.parse(localStorage.getItem('list')!))
			
			const userId = localStorage.getItem('id');
			if(userId != null)
			setUserId(userId)
			else
			localStorage.setItem('id', uuidv4());
		}
		init();
	},[]);

	let  {data, error} = useSWR(searchInput, fetcher)

    if (error) return <div className="grid h-screen place-items-center">Error: Failed to load</div>
    if (!data) return <div className="grid h-screen place-items-center">
						<ClockLoader speedMultiplier={3} color={"#595959"} size={60}/>
					  </div>

	const search = (e:any) => {

		if(input.length < 2 || input.length > 50){
			return;
		}
		else{
			e.preventDefault();
			setQuantity(new Array(24).fill(1)) 
			setSearchInput(input);
		}
	}

	const addProduct = async (_data: any, quantity: number) => {

	   let _list = list;
	   const found = list.find(el => el.name == _data.product_name);

       if (!found){
	     	_list = [...list, {name: _data.product_name, quantity: quantity, imageUrl: _data.image_url}]
           setList(_list)
	   }
	   else{
			const index = list.findIndex(obj => obj.name == _data.product_name);
			_list[index].quantity+=quantity;
			setList(_list)
	   }

	   localStorage.setItem('list', JSON.stringify(_list));
	   //console.log(_list)

	    // save online db
	    updateListAPI(_list);

		// getListAPI();
	}

	const updateListAPI = async (_list:any) => {

		try{
			await fetch(`http://localhost:4000/update_list`, {
				method: 'POST',
				body: JSON.stringify({
					id: userId,
					list: _list,
				}),
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
				},
				})
				.then((response) => response.json())
				.then((data) => {
				console.log(data);
				})
				.catch((err) => {
				console.log(err.message);
			});
	    }catch(e){console.log(e)}
	}

	const getListAPI = async () => {

		try{
			await fetch(`http://localhost:4000/get_list`, {
				method: 'POST',
				body: JSON.stringify({
					id: userId,
				}),
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
				},
				})
				.then((response) => response.json())
				.then((data) => {
				  console.log(data["list"])
				  setList(data["list"])
				})
				.catch((err) => {
				  console.log(err.message);
			});
	    }catch(e){console.log(e)}
	}

	if (data) return (
		<div>	
		<nav className="bg-white border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 rounded w-screen fixed z-50 md:rounded-b-3xl  backdrop-filter bg-clip-padding bg-opacity-60 dark:bg-gray-900 backdrop-blur-xl border-b">
			<div className="container flex flex-wrap items-center justify-between mx-auto">
			<Link href="/" className="flex items-center">
				<Image draggable={false} src={carrefourLogo} height={window.innerWidth >= 640 ? 40 : 36} alt="Carrefour logo" />
				<span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white ml-4">Carrefour</span>
			</Link>
			<div className="flex">
				<div className="relative hidden md:block md:items-center 2xl:ml-12 2xl:w-[600px] lg:w-[500px] md:w-80">
					<form>   
						<label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
							</div>
							<input value={input} onChange={(e) => setInput(e.target.value)} id="search-navbar-desktop" minLength={2} maxLength={50} className="block w-full p-3 pl-10 text-sm bg-opacity-60 bg-gray-50 dark:bg-gray-700 text-gray-900 border border-gray-300 rounded-lg  focus:ring-blue-500 focus:border-blue-500  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Recherchez un produit..." type="search" required/>
							<button onClick={(e) => search(e)} type="submit" className="text-white -mb-1 absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-800 dark:hover:bg-blue-900 opacity-95">Search</button>
						</div>
					</form>
				</div>
				<button data-collapse-toggle="navbar-search" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-search" aria-expanded="false">
				<span className="sr-only">Open menu</span>
				<svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
				</button>
			</div>
			<div className="items-center justify-between w-full md:flex md:w-auto md:order-1" id="navbar-search">
				<div className="relative mt-3 md:hidden">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					<svg className="w-5 h-5 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
					</div>
					<form>   
						<label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
							</div>
							<input value={input} onChange={(e) => setInput(e.target.value)} id="search-navbar-mobile" className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Recherchez un produit..." type="search" required/>
							<button onClick={(e) => { e.preventDefault(); setSearchInput(input); }} type="submit" className="text-white -mb-1.5 absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-800 dark:hover:bg-blue-900 opacity-95">Search</button>
						</div>
					</form>
				</div>
				<ul className="hidden md:flex flex-col p-4 mt-4 border border-gray-100 rounded-lg  md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0  dark:border-gray-700 bg-transparent">
					<li className="relative">
						<svg onClick={() => setOpen(true)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 opacity-90 cursor-pointer hover:-translate-y-1 hover:scale-105">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
						</svg>
						{list.length > 0 &&
					      <div className="absolute pointer-events-none inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2 dark:border-gray-900">{list.length}</div>
                        }
					</li>
					<li>
					<a href="#" className="block py-2 pl-3 pr-4 text-blue-7800 bg-white rounded md:bg-transparent text-blue-700 md:p-0 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-400" aria-current="page">Home</a>
					</li>
					<li>
					<a href="#" className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">About</a>
					</li>
					<li>
					<a href="#" className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Services</a>
					</li>
				</ul>
				</div>
			</div>
		</nav>

        <div className="h-32 md:h-[88px]"/>
		   {data?.products?.length > 0 ?
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mx-6">
				{data?.products?.map((_data:any, _index:number) => {
					return (
						<ul key={_data.code}>						
							<li className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700  transition ease-in-out hover:-translate-y-1 hover:scale-110">
								<Image loading="eager" className="rounded-t-lg w-full h-48 object-cover" height={192} width={192} src={_data.image_url} alt={_data.product_name} draggable={false}/>
								<div className="p-5">
									<h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate	 overflow-hidden">{_data.product_name}</h5>
                                    <div className="flex flex-row">
										<div className="custom-number-input w-24 mb-0.5 mr-2 -ml-2">
											<div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
												<button onClick={() => {
													if(quantity[_index] > 1){
														console.log(quantity[_index])
														const _quantity = quantity;
														_quantity[_index]-=1;
														setQuantity([..._quantity]) 
													}
												}} 
												data-action="decrement" className=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none">
												   <span className="m-auto text-xl font-thin">−</span>
												</button>
												<input value={quantity[_index]} onChange={(e) => {
													const _quantity = quantity;
													_quantity[_index]= parseInt(e.target.value);
													setQuantity([..._quantity]) 
													
												}} minLength={1} maxLength={2} type="number" className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700" name="custom-input-number" aria-label="Counter"  placeholder="" id={"counter-"+_index}></input>
												<button onClick={() => {
													if(quantity[_index] < 99){
														const _quantity = quantity;
														_quantity[_index]+=1;
														setQuantity([..._quantity]) 
													}
				                                    }}  
													data-action="increment" className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer">
													<span className="m-auto text-xl font-thin">+</span>
												</button>
											</div>
										</div>
										<button onClick={() => (quantity[_index] > 0 && quantity[_index] <= 99) && addProduct(_data, quantity[_index])} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-gray-700 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-blue-300 dark:bg-gray-700 dark:hover:bg-blue-900 dark:focus:ring-blue-900">
											Ajouter
											<svg aria-hidden="true" className="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
										</button>
									</div>
								</div>
							</li>
						</ul>
					)
					}
				)}
			</div>
			:
			<div>
				<h1 className="grid h-[85vh] place-items-center">Désolé, aucun produit ne correspond à votre requête.</h1>
			</div>
            }


			<Transition.Root show={open} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={setOpen}>
				<Transition.Child
					as={Fragment}
					enter="ease-in-out duration-500"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in-out duration-500"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0  backdrop-blur-sm	backdrop-brightness-75 transition-opacity " />
				</Transition.Child>

				<div className="fixed inset-0 overflow-hidden">
					<div className="absolute inset-0 overflow-hidden">
					<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
						<Transition.Child
						as={Fragment}
						enter="transform transition ease-in-out duration-500 sm:duration-700"
						enterFrom="translate-x-full"
						enterTo="translate-x-0"
						leave="transform transition ease-in-out duration-500 sm:duration-700"
						leaveFrom="translate-x-0"
						leaveTo="translate-x-full"
						>
						<Dialog.Panel className="pointer-events-auto w-screen max-w-md bg-gray-900">
							<div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
							<div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
								<div className="flex items-start justify-between">
								<Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-200">Shopping cart</Dialog.Title>
								<div className="ml-3 flex h-7 items-center">
									<button
									type="button"
									className="-m-2 p-2 text-gray-400 hover:text-gray-500"
									onClick={() => setOpen(false)}
									>
									<span className="sr-only">Close panel</span>
									<XMarkIcon className="h-6 w-6" aria-hidden="true" />
									</button>
								</div>
								</div>

								<div className="mt-8 overflow-hidden">
								<div className="flow-root overflow-hidden">
									<ul role="list" className="-my-6 divide-y divide-gray-200 dark:divide-gray-800">
									{list.map((product, index) => (
										<li key={product.name} className="flex py-6">
										<div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
											<Image
											src={product.imageUrl}
											alt={product.name}
											width={100}
											height={100}
											className="h-full w-full object-cover object-center"
											/>
										</div>

										<div className="ml-4 flex flex-1 flex-col">
											<div>
											<div className="flex justify-between text-base font-medium text-gray-900">
												<h3>
												<p className="text-gray-500 dark:text-gray-200 truncate	overflow-hidden">{product.name}</p>
												</h3>
												{/* <p className="ml-4">{product.price}</p> */}
											</div> 
											 {/* <p className="mt-1 text-sm text-gray-500">{product.color}</p> */}
											</div>
											<div className="flex flex-1 items-end justify-between text-sm">
											<p className="text-gray-500 dark:text-gray-200">Qty {product.quantity}</p>

											<div className="flex">
												<button
												onClick={() => {
													const _list =[
														...list.slice(0, index),
														...list.slice(index + 1)
													];
													setList(_list);
												    localStorage.setItem('list', JSON.stringify(_list));
													// save to online db
													updateListAPI(_list);
												}}
												type="button"
												className="font-medium text-indigo-600 hover:text-indigo-500"
												>
												Remove
												</button>
											</div>
											</div>
										</div>
										</li>
									))}
									</ul>
								</div>
								</div>
							</div>

							<div className="border-t border-gray-200 dark:border-gray-800 py-6 px-4 sm:px-6">
								<div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-200">
								<p>Total</p>
								<p>74.99€</p>
								</div>
								<p className="mt-0.5 text-sm text-gray-500 dark:text-gray-200">Livraison et taxes calculées au checkout.</p>
								<div className="mt-6">
								<a
									href="#"
									className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
								>
									Checkout
								</a>
								</div>
								<div className="mt-6 flex justify-center text-center text-sm text-gray-500 dark:text-gray-200">
								<p>
									ou
									<button
									type="button"
									className="font-medium text-indigo-600 hover:text-indigo-500"
									onClick={() => setOpen(false)}
									>
									 &nbsp;&nbsp;Continuer mes achats
									<span aria-hidden="true"> &rarr;</span>
									</button>
								</p>
								</div>
							</div>
							</div>
						</Dialog.Panel>
						</Transition.Child>
					</div>
					</div>
				</div>
				</Dialog>
			</Transition.Root>

			<div className="h-10"/>
		</div>
	)
}
