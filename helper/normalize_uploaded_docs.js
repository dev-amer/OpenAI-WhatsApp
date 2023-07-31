function normalizeDocuments(docs) {
    return docs.map((doc) => {
        if (typeof doc.pageContent === "string") {
            return doc.pageContent;
        } else if (Array.isArray(doc.pageContent)) {
            return doc.pageContent.join("\n");
        }
    });
}
const fileTypes = ['application/pdf', 'text/plain']
module.exports = {
    normalizeDocuments,
    fileTypes
}