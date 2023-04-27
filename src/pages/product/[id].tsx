import axios from "axios"
import Head from "next/head"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/router"
import { GetStaticPaths, GetStaticProps } from "next"
import Stripe from "stripe"

import { stripe } from "@/lib/stripe"

import { ImageContainer, ProductContainer, ProductDetails } from "@/styles/pages/product"

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
    defaultPriceId: string
  }
}

export default function Product({product}: ProductProps) {
    const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)
    const { isFallback } = useRouter()

    async function handleBuyProduct() {
      try {
        setIsCreatingCheckoutSession(true)

        const response = await axios.post('/api/checkout', {
          priceId: product.defaultPriceId
        })

        const { checkoutUrl } = response.data;

        window.location.href = checkoutUrl // external URL uses window.location
      } catch (err) {
        // conectar com uma ferramenta de obesrvabilidade (sentry/data dog)

        setIsCreatingCheckoutSession(false)

        alert('Erro ao processar o pagamento. Tente novamente mais tarde.')
      }
    }

    if (isFallback) {
      return <p>Carregando...</p>
    }

    return (
    <>
    <Head>
      <title>{product.name} - Loja</title>
    </Head>

    <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt='' />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button 
          onClick={handleBuyProduct}
          disabled={isCreatingCheckoutSession}>
            Comprar agora
          </button>
        </ProductDetails>
        </ProductContainer>
    </>
    )
  }

  export const getStaticPaths: GetStaticPaths = async () => {
    // buscar somente os mais acessados / vendidos
    // ou nenhum pra ser atualizado conforme acessos em prod

    return {
      paths: [
        { params: { id: 'prod_NkHJjKq5b10J6f' } }
      ],
      fallback: true
    }
  }

  // GetStaticProps recebe alguns generics do TS:
  // O 1o é qual o retorno de dentro dele, as props
  // O 2o é quais os parâmetros que ele recebe
  /*  
  acho que algo relacionado a config strict
  nao permitiu usar GetStaticProps<any, {id: string}> 
  */
  export const getStaticProps: GetStaticProps = async ({ params }) => {
    const productId = params?.id

    const product = await stripe.products.retrieve(productId as string, {
      expand: ['default_price'] // por ser um único produto, nao precisa do data.
    })

    const price = product.default_price as Stripe.Price
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price.unit_amount! / 100)

    return {
      props: {
        product: {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0],
          price: formattedPrice,
          description: product.description,
          defaultPriceId: price.id
        }
      },
      revalidate: 60 * 60 * 1 // 1 hour
    }
  }