import * as Sentry from "@sentry/node";

import { documentSummarizer } from "./summarizer/document-summarizer";
const { createClient } = require("@supabase/supabase-js");

Sentry.init({
  dsn: process.env.SENTRY_DSN
});

const handleError = (error: Error) => {
  console.error(error);
  Sentry.captureException(error);
};
/**
 * Handles the summarization and updating of a document.
 *
 * This function takes an event object as input, which contains the text of the document to be chunked and summarized
 * and then persisted in a Supabase database table specified by the input id and tableName in column called summary.
 *
 * @param {Object} event - The event object containing the necessary data.
 * @param {string} event.text - The text of the document to be summarized.
 * @param {string} event.tableName - The name of the database table where the summary should be stored.
 * @param {string} event.id - The ID of the record to be updated.
 * @returns {Promise<string>} The original text of the document, or throws an error.
 * @throws {Error} When an error occurs in document summarization or database operations.
 */
export const handler = async (event: any, _context: any) => {
  try {
    const summary = await documentSummarizer(event.text);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    await supabase
      .from(event.tableName)
      .update({ summary })
      .eq("id", event.id)
      .throwOnError();

    return event.text;
  } catch (error: any) {
    return handleError(error);
  }
};
