export default function AdmissionDocuments() {
  return (
    <div id="admission-documents" className="section action-section">
      <h2>Admission Documents</h2>
      <p className="subtitle headings">Download your admission documents!</p>
      <p
        id="admissionNumber"
        className="subtitle"
        style={{ fontWeight: "bold" }}
      ></p>
      <div className="action-buttons">
        <button className="action-button primary" disabled>
          Download Admission Letter
        </button>
        <button className="action-button primary" disabled>
          Download Prospectus
        </button>
        <button className="action-button primary" disabled>
          Download Personal Record
        </button>
        <button className="action-button primary" disabled>
          Download Other Documents
        </button>
      </div>
    </div>
  );
}
