import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { ImageContainer, ProductContainer, ProductDetails } from "@/styles/pages/product"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"
import Image from "next/image"

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
  }
}

export default function Product({product}: ProductProps) {
    const { query } = useRouter()

    return (
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt='' />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button>Comprar agora</button>
        </ProductDetails>
        </ProductContainer>
    )
  }

  export const getStaticPaths: GetStaticPaths = async () => {
    return {
      paths: [
        { params: { id: 'prod_NkHJjKq5b10J6f' } }
      ],
      fallback: false
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
          description: product.description
        }
      },
      revalidate: 60 * 60 * 1 // 1 hour
    }
  }