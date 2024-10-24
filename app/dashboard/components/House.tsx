export default function House({
  gender,
  houseAssigned,
}: {
  gender: string;
  houseAssigned: string;
}) {
  return (
    <div id="house" className="section">
      <h2>House</h2>
      <p className="subtitle flashing-text headings">
        House will be assigned automatically.
      </p>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="gender">
            Gender <span className="required">*</span>
          </label>
          <input type="text" id="gender" value={gender} required disabled />
        </div>
        <div className="form-group">
          <label htmlFor="houseAssigned">
            House Assigned <span className="required">*</span>
          </label>
          <input
            type="text"
            id="houseAssigned"
            value={houseAssigned}
            required
            disabled
          />
        </div>
      </div>
    </div>
  );
}
