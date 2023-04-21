import Image from "next/image";
import {  GetStaticProps } from "next";
import Stripe from "stripe";
import { useKeenSlider } from "keen-slider/react";

import { stripe } from "@/lib/stripe";
import { HomeContainer, Product } from "@/styles/pages/home";

import 'keen-slider/keen-slider.min.css'

interface HomeProps {
  list: number[]
  products: {
    id: string
    name: string
    imageUrl: string
    price: number
  }[]
}

export default function Home({products}: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  })

  return (
    <HomeContainer ref={sliderRef}>

    {products.map((product) => {
      const {id, imageUrl, name, price} = product
      return (
      <Product key={id} className="keen-slider__slide">
        <Image 
        src={imageUrl}
        blurDataURL={imageUrl}
        width={520} height={480} alt="" />
    
        <footer>
          <strong>{name}</strong>
          <span>R$ {price.toFixed(2)}</span>
        </footer>
    </Product> )
    })}

    </HomeContainer>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    // como é uma lista, é necessário pegar dentro de data
    expand: ['data.default_price'],
  })

  
  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: price.unit_amount! / 100,
    }
  })

  return {
    props: {
      products
    }, 
      revalidate: 10,
  }
}