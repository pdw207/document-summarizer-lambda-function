import { OpenAI } from 'langchain/llms/openai'
import { LLMChain } from 'langchain/chains'
import { PromptTemplate } from 'langchain/prompts'
import Bottleneck from 'bottleneck'

const TEMPLATE = `Summarize the text in the CONTENT. You should follow the following rules when generating the summary:
    - Any code found in the CONTENT should ALWAYS be preserved in the summary, unchanged.
    - Code will be surrounded by backticks (\`) or triple backticks (\`\`\`).
    - Summary should include code examples when possible. Do not make up any code examples on your own.
    - The summary should be under 4000 characters.
    - The summary should be at least 1500 characters long, if possible.

    CONTENT: {document}

    RESULT:
    `

const limiter = new Bottleneck({ minTime: 5050 })

const llm = new OpenAI({
  concurrency: 10,
  temperature: 0,
  modelName: 'gpt-3.5-turbo'
})

const chunkString = (inputString: string, chunkSize: number): string[] => {
  const totalChunks = Math.ceil(inputString.length / chunkSize)
  const result: string[] = []

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = start + chunkSize
    result.push(inputString.slice(start, end))
  }

  return result
}

/**
 * Summarizes a given document using LLMChain.
 *
 * @param {string} document - The document to summarize.
 * @returns {Promise<string>} - The summarized document.
 * @throws {Error} - Throws an error if summarization fails.
 */
const summarize = async (document: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const prompt = new PromptTemplate({
        template: TEMPLATE,
        inputVariables: ['document']
      })
      const chain = new LLMChain({ prompt, llm })

      const result = await chain.call({
        prompt,
        document
      })

      resolve(result.text)
    } catch (error) {
      console.error('An error occurred during summarization:', error)
      reject(new Error('Summarization failed'))
    }
  })
}

const rateLimitedSummarize = limiter.wrap(summarize)

/**
 * Summarizes a long document by breaking it into smaller chunks and summarizing each chunk.
 *
 * @param {string} document - The document to summarize.
 * @returns {Promise<string>} - The summarized document.
 * @throws {Error} - Throws an error if summarization fails.
 */
export const documentSummarizer = async (document: string): Promise<string> => {
  const templateLength = TEMPLATE.length
  const MAX_DOCUMENT_SIZE = 4000 // Max allowable size including the template
  const maxChunkSize = MAX_DOCUMENT_SIZE - templateLength - 1 // Max size for each document chunk

  try {
    while (true) {
      // Keep trying until the document is short enough
      const totalLength = document.length + templateLength

      // If document is to long chunk further
      if (totalLength > MAX_DOCUMENT_SIZE) {
        // Chunk the document to fit within the MAX_DOCUMENT_SIZE character limit
        const chunks = chunkString(document, maxChunkSize)
        const summarizedChunks: string[] = await Promise.all(
          chunks.map(async chunk => rateLimitedSummarize(chunk))
        )

        // Join the summarized chunks
        document = summarizedChunks.join('\n')

        // check document length and continue chunking and summarizing if over threashold
        if (document.length + templateLength > MAX_DOCUMENT_SIZE) {
          continue
        } else {
          return document
        }
      } else {
        return document
      }
    }
  } catch (error: any) {
    console.error(error)
    throw new Error('Document Summarization failed')
  }
}
