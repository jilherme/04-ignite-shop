import { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import Stripe from "stripe";
import { useKeenSlider } from "keen-slider/react";

import { stripe } from "@/lib/stripe";
import { HomeContainer, Product } from "@/styles/pages/home";

import "keen-slider/keen-slider.min.css";

interface HomeProps {
  list: number[];
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[];
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  });

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>

      <HomeContainer ref={sliderRef}>
        {products.map((product) => {
          const { id, imageUrl, name, price } = product;
          return (
            <Link
              key={id}
              href={`/product/${id}`}
              prefetch={false} // only prefetch when user hovers, not when in viewport
            >
              <Product className="keen-slider__slide">
                <Image src={imageUrl} width={520} height={480} alt="" />

                <footer>
                  <strong>{name}</strong>
                  <span>{price}</span>
                </footer>
              </Product>
            </Link>
          );
        })}
      </HomeContainer>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    // como é uma lista, é necessário pegar dentro de data
    expand: ["data.default_price"],
  });

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price;
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price.unit_amount! / 100);

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: formattedPrice,
    };
  });

  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 2, // 2 hours
  };
};
