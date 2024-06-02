import Model from './Model'

export default function Welcome() {
  return (
    <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-20'>
            <Model />
            <h1 className='mt-20 text-4xl font-bold'>
                ChatGPT免费使用 - GPT4 & GPT3.5-turbo
            </h1>
            {/* <Example /> */}
        </div>
  )
}
