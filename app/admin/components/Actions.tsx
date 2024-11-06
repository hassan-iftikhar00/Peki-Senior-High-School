import React, { useState } from "react";

export default function Actions() {
  const [voucherPrice, setVoucherPrice] = useState(50);
  const [voucherMessage, setVoucherMessage] = useState(
    "Thank you for purchasing an admission voucher.\nYour application process can now begin."
  );
  const [bulkMessage, setBulkMessage] = useState(
    "Apply now for admission to our school! Visit our\nwebsite for more information."
  );

  return (
    <div className="inner-content">
      <div className="actions-page">
        <div className="actions-header">
          <h2>Actions</h2>
          <p className="subtitle">
            Manage admission voucher and messages here.
          </p>
        </div>

        <div className="actions-card">
          <form className="actions-form">
            <div className="action-group">
              <label htmlFor="voucherPrice">
                <span className="label-text">Admission</span>{" "}
                <span className="label-text">Voucher</span>{" "}
                <span className="label-text">Price</span>
              </label>
              <div className="input-with-button">
                <input
                  type="number"
                  id="voucherPrice"
                  value={voucherPrice}
                  onChange={(e) => setVoucherPrice(Number(e.target.value))}
                  className="price-input"
                />
                <button type="button" className="action-button not-admin">
                  Save
                </button>
              </div>
            </div>

            <div className="action-group">
              <label htmlFor="voucherMessage">
                <span className="label-text">Message</span>{" "}
                <span className="label-text">After</span>{" "}
                <span className="label-text">Voucher</span>{" "}
                <span className="label-text">Purchase</span>
              </label>
              <div className="input-with-button">
                <textarea
                  id="voucherMessage"
                  value={voucherMessage}
                  onChange={(e) => setVoucherMessage(e.target.value)}
                  className="message-input"
                  rows={4}
                ></textarea>
                <button type="button" className="action-button not-admin">
                  Send
                </button>
              </div>
            </div>

            <div className="action-group">
              <label htmlFor="bulkMessage">
                <span className="label-text">Bulk</span>{" "}
                <span className="label-text">Message</span>{" "}
                <span className="label-text">to</span>{" "}
                <span className="label-text">Applic</span>{" "}
                <span className="label-text">ants</span>
              </label>
              <div className="input-with-button">
                <textarea
                  id="bulkMessage"
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  className="message-input"
                  rows={4}
                ></textarea>
                <button type="button" className="action-button not-admin">
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
