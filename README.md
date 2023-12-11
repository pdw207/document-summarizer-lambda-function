# Document Summarization Service

### Overview

This service summarizes textual content and persists the summary in a specified database table. It uses langChain, OpenAI's GPT-3.5 model, Supabase, Sentry and AWS lambda.

### Features

- Recursive Chunking: Handles long documents by breaking them into smaller chunks, avoiding token limit failures with OpenAI, ensuring that even extensive documents can be summarized without issues.
- Rate Limiting: Utilizes Bottleneck to manage request rates, preserving system stability and adhering to API usage constraints.
- Integration: Uses Supabase for database operations and Sentry for error tracking, ensuring a robust and reliable service.

### Setup

#### Repository Setup:

- Clone the repository.
- Run `npm install` to install dependencies.

#### Environment Configuration:

- Copy the example environment file: `cp .env.example .env.`
- Update the .env file with your credentials (Supabase URL, Supabase anon key, Sentry DSN).

### Usage

#### Document Summarization:

Use the documentSummarizer function to process and summarize documents. It handles chunking and summarization internally, providing a seamless experience.

#### AWS Lambda Integration:

The handler function is designed for AWS Lambda deployment. It accepts an event object containing the document text, the target database table name, and the record ID for updates.
