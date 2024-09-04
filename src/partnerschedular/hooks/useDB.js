import { usePGlite } from '@electric-sql/pglite-react';

const useDB = () => {
  const db = usePGlite();

  const insertDocument = async (partnerName, documentTitle, documentContent, embedding) => {
    await db.query(
      'INSERT INTO partners_documents (partner_name, document_title, document_content, embedding) VALUES ($1, $2, $3, $4)',
      [partnerName, documentTitle, documentContent, embedding]
    );
  };

  const fetchDocuments = async () => {
    const result = await db.query('SELECT * FROM partners_documents');
    return result.rows;
  };

  return {
    insertDocument,
    fetchDocuments
  };
};

export default useDB;
