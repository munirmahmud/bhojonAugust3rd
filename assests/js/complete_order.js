const { ipcRenderer, ipcMain } = require("electron");

const completeOrderTable = document.getElementById("complete_order_table");
const totalAmountTable = document.getElementById("total_amount_table");
const paymentMethod = document.getElementById("payment_method__dropdown");
let customerPaymentInput = document.getElementById("customer_payment");
const cardTerminal = document.getElementById("card_terminalSelect");
const cardpaymentOption = document.getElementById("payment_left");
const addNewPaymentBtn = document.getElementById("add_more_payment_method");
const addNewPayment = document.getElementById("add_new_payment");
const paymentMthod2 = document.getElementById("payment_method2");
const payBtn = document.getElementById("pay_now");

ipcRenderer.on("completeOrderOnpageloadInfoSent", (e, pageLaodInfo) => {
  pageLaodInfo[0].orderInfo.map((element) => {
    let tableTr = document.createElement("tr");

    let select = document.createElement("td");
    let inputSelect = document.createElement("input");
    inputSelect.type = "checkbox";
    inputSelect.onclick = () => gettingOrderIdFromCB(element.id);
    inputSelect.id = "check_box";
    select.append(inputSelect);

    let orderNo = document.createElement("td");
    orderNo.textContent = element.saleinvoice;

    let totalAmount = document.createElement("td");
    totalAmount.textContent = parseFloat(element.totalamount).toFixed(2);

    let paidAmount = document.createElement("td");
    let converttoFloat = parseFloat(element.customerpaid).toFixed(2);
    paidAmount.textContent = converttoFloat;

    let due = document.createElement("td");
    due.textContent = parseFloat(element.totalamount).toFixed(2);
    tableTr.append(select, orderNo, totalAmount, paidAmount, due);
    completeOrderTable.append(tableTr);
    //customerPaymentInput.value = parseFloat(element.totalamount).toFixed(2);
  });

  let content = "";
  pageLaodInfo[0].orderInfo.map((element) => {
    content = ` <tr>
     <td>
         Total Amount
     </td>
     <td id="totalamount_marge">  ${parseFloat(element.totalamount).toFixed(
       2
     )}</td>
  </tr>
  <tr>
     <td>
         Total Due
     </td>
     <td id="due-amount">  ${parseFloat(element.totalamount).toFixed(2)}</td>
  </tr>
  <tr>
     <td>
         Paid amount
     </td>
     <td id="pay-amount">0</td>
  </tr>
  <tr>
     <td>
         Change Amount
     </td>
     <td id="change-amount">0</td>
  </tr>`;
  });
  totalAmountTable.innerHTML = content;

  let options = "";
  pageLaodInfo[0].paymentMethod.map((payment) => {
    options += ` <option value="${payment.payment_method_id}">${payment.payment_method}</option>`;
  });
  paymentMethod.innerHTML += options;

  let payBtnContent = "";
  payBtnContent = `    <button type="button" class="btn btn-success w-md m-b-5" id="pay_now_btn"
  onclick="payNow(${pageLaodInfo[0].orderInfo[0].id})">Pay
  Now &amp; Print Invoice</button>`;

  document.getElementById("payNowButtonDiv").innerHTML = payBtnContent;
});

function gettingOrderIdFromCB(orderId) {
  ipcRenderer.send("OrderIdSentFromCheckbox", orderId);
}
ipcRenderer.on("checkBoxCheckedUncheckedOperation", (e, result) => {
  let content = "";
  let uncheckedContent = "";
  result.map((element) => {
    content = ` <tr>
     <td>
         Total Amount
     </td>
     <td id="totalamount_marge">${parseFloat(element.totalamount).toFixed(
       2
     )}</td>
  </tr>
  <tr>
     <td>
         Total Due
     </td>
     <td id="due-amount">${parseFloat(element.totalamount).toFixed(2)}</td>
  </tr>
  <tr>
     <td>
         Paid amount
     </td>
     <td id="pay-amount">
         ${parseFloat(element.totalamount).toFixed(2)}                     
     </td>
  </tr>
  <tr>
     <td>
         Change Amount
     </td>
     <td id="change-amount">
     ${parseFloat(0).toFixed(2)}           
  
     </td>
  </tr>`;
    uncheckedContent = `<tr>
  <td>
      Total Amount
  </td>
  <td id="totalamount_marge">0.00</td>
</tr>
<tr>
  <td>
      Total Due
  </td>
  <td id="due-amount">0.00</td>
</tr>
<tr>
  <td>
      Paid amount
  </td>
  <td id="pay-amount">
      ${parseFloat(element.totalamount).toFixed(2)}                     
  </td>
</tr>
<tr>
  <td>
      Change Amount
  </td>
  <td id="change-amount">
  ${parseFloat(element.totalamount).toFixed(2)}                     

  </td>
</tr>`;
  });
  const cb = document.getElementById("check_box");
  if (cb.checked == true) {
    totalAmountTable.innerHTML = content;
  } else {
    totalAmountTable.innerHTML = uncheckedContent;
  }
});

// show/hide the bank,card terminal details based on their payment method types
let mainDivPAyment = document.getElementById("field");
let paymentTypeId;
function showhidecard(hiddenDivId, element) {
  document.getElementById("payment_left").style.display =
    element.value == "1" ? "block" : "none";
  let paymentType = mainDivPAyment.querySelector("#payment_method__dropdown");
  paymentTypeId = paymentType.options[paymentType.selectedIndex].value;
}
// end of show/hide the bank,card terminal details based on their payment method types

ipcRenderer.on("cardTerminalWithBankListSent", (e, cardWithBank) => {
  let content = "";

  content = `<div class="row no-gutters">

  <div class="form-group col-md-6">
      <label for="card_terminal" class="col-form-label">Card Terminal</label>
      <select id="card_terminalSelect" name="card_terminal[]"
          class="postform resizeselect form-control select2-hidden-accessible" tabindex="-1"
          aria-hidden="true">
        
          ${cardWithBank[0].cardTerminal.map((i) => {
            return `<option value="${i.card_terminalid}" selected="selected">${i.terminal_name}</option>`;
          })}
               
      </select>
  </div>
  <div class="form-group col-md-6">
      <label for="bank" class="col-form-label">Select Bank</label>
      <select id="bank_select" name="bank[]"
          class="postform resizeselect form-control select2-hidden-accessible" tabindex="-1"
          aria-hidden="true">
        ${cardWithBank[0].bankList.map((bank) => {
          return `<option value="${bank.bankid}" selected="selected">${bank.bank_name}</option>`;
        })}
      </select>

  </div>
  <div class="form-group col-md-6">
      <label for="4digit" class="col-form-label">Last 4 Digit</label>
      <input type="text" class="form-control" name="last4digit[]" value="">
  </div>

</div>`;
  cardpaymentOption.innerHTML = content;
  cardpaymentOption.style.display = "none";
});

function inputNumbersfocus(clickedValue) {
  customerPaymentInput.value += clickedValue;
  if (customerPaymentInput.value.length == 0) {
    customerPaymentInput.value += clickedValue;
  }
}

let paymentMainDiv = document.getElementById("field");

function changeAmount(element) {
  let cPaymentlist = [
    ...paymentMainDiv.querySelectorAll("input.customerPayment"),
  ];
  let customerPayments = 0;
  cPaymentlist.map((payment) => {
    let intPayment = parseInt(payment.value);
    customerPayments = customerPayments + intPayment;
  });

  let floatCustomerPaidAmount = parseFloat(customerPayments);

  let paidAmountElement = document.querySelector(
    "#total_amount_table #pay-amount"
  );
  let changeAmountElement = document.querySelector(
    "#total_amount_table #change-amount"
  );
  let totalAmountELement = document.querySelector(
    "#total_amount_table #totalamount_marge"
  );
  let dueAmountElement = document.querySelector(
    "#total_amount_table #due-amount"
  );
  let dueAmount = dueAmountElement.textContent;

  let totalAmount = totalAmountELement.textContent;
  let floatTotalAmount = parseFloat(totalAmount);

  let paidAmount = paidAmountElement.textContent;
  let floatPaidAmount = parseFloat(paidAmount);

  let changeAmount = changeAmountElement.textContent;
  let floatChangeAmount = parseFloat(changeAmount);

  if (floatCustomerPaidAmount > floatTotalAmount) {
    let newChangeAmount = (floatCustomerPaidAmount - floatTotalAmount).toFixed(
      2
    );
    changeAmountElement.textContent = newChangeAmount;
  } else {
    changeAmountElement.textContent = "0";
  }

  if (floatCustomerPaidAmount > floatTotalAmount) {
    paidAmountElement.textContent = floatCustomerPaidAmount;
  } else {
    paidAmountElement.textContent = "0";
  }
  if (floatCustomerPaidAmount > floatTotalAmount) {
    dueAmountElement.textContent = 0;
  } else {
    dueAmountElement.textContent = floatTotalAmount;
  }
}

// adding multiple payment methods start here
let next = 0;
addNewPaymentBtn.addEventListener("click", (e) => {
  e.preventDefault();
  next = next + 1;

  let divId = document.getElementById("field").id;

  let uniqueId = divId + next;
  var cln = document
    .getElementsByClassName("row no-gutters")[0]
    .cloneNode(true);

  let removeBtn = document.createElement("button");
  removeBtn.id = uniqueId;
  removeBtn.type = "button";
  removeBtn.classList = "close close_div col-md-12 text-right";
  removeBtn.onclick = () => removePaymentMethod(uniqueId);
  removeBtn.textContent = "X";
  cln.insertBefore(removeBtn, cln.childNodes[0]);

  let div = document.createElement("Div");
  div.id = uniqueId;
  div.classList.add("payment-method");
  div.append(cln);
  document.getElementById("field").append(div);
});
// dding multiple payment methods  end here

//remove specifc payment method start here
let paymentMethodlist = document.querySelector("#payment_methods");

function removePaymentMethod(id) {
  const paymentFields = [...paymentMethodlist.querySelectorAll("button.close")];

  paymentFields.map((field) => {
    if (field.id == id) {
      field.parentElement.remove();
      document.getElementById("payment_left").style.display = "none";
    }
    changeAmount();
  });
}
//remove specific payment end here

function showPaymentDiv(hiddenDivId, element) {
  document.getElementById("addNewPayment").style.display =
    element.value == "1" ? "block" : "none";
}

// ipcRenderer.on("PaymentMEthodcardTerminalWithBankListSent", (e, result) => {
//   let pMethodContent = `<div id="field' +
//   next +
//   '" name="field' +
//   next +
//   '" class="row col-md-12 m-0" >
//   <div class="row no-gutters">
//   <button id="remove' +
//         (next - 1) +
//         '" class="btn btn-danger remove-me text-end" onclick="removePaymentMethod()"  aria-label="Close">
//           <span aria-hidden="true">×</span>
//       </button>
//       <div class="row no-gutters">
//           <div class="form-group col-md-6">
//               <label for="payments" class="col-form-label pb-2">Payment Method</label>
            
//               <select name="paytype"
//                   class="card_typesl postform resizeselect form-control  select2-hidden-accessible"
//                   onchange="showhidecard('payment_left', this)" tabindex="-1" aria-hidden="true"  class="payment_method" id="payment_method2">
//                 ${result[0].paymentMethod.map((method) => {
//                   return `<option value="${method.payment_method_id}">${method.payment_method}</option>`;
//                 })}
//               </select>
//           </div>
//           <div class="form-group col-md-6">
//               <label for="4digit" class="col-form-label pb-2">Customer Payment</label>
//               <input type="number" class="form-control number pay" id="customer_payment" name="paidamount[]" 
//                   placeholder="0" onkeyup="changeamount(value)" onfocus="givefocus(this)">
//           </div>
//       </div>
//   </div>
// </div>`;

//   addNewPayment.innerHTML = pMethodContent;
//   addNewPayment.style.display = "none";
// });

// final payment for the order start here
let paymenTDiv = document.getElementById("field");

function payNow(id) {
  // start of creating  object from two array to get the payment method id and paid amount together
  // to insert multiple paymentid and amout to the database
  let cPaymentlist = [...paymenTDiv.querySelectorAll("select.card_typesl")];
  let paymentAmounts = [
    ...paymenTDiv.querySelectorAll("input.customerPayment"),
  ];

  let paymentMethodArr = [];
  let paymentAmountArr = [];

  cPaymentlist.map((paymentMethod) =>
    paymentMethodArr.push(paymentMethod.value)
  );
  paymentAmounts.map((paymentAmount) =>
    paymentAmountArr.push(paymentAmount.value)
  );

  const keys = paymentMethodArr; //payment method id as keys
  const values = paymentAmountArr; //payment amount as values
  let result = {};
  keys.map((key, i) => (result[key] = values[i]));
  // end of creating  object from two array to get the payment method id and paid amount together

  // bill amount and payment method id for single payment method
  let bill_amount = "";
  let payment_method_id = "";
  for (const [key, value] of Object.entries(result)) {
    payment_method_id = `${key}`;
    //bill_amount = `${value}`;
  }
  //end of bill amount and payment method id or single payment method

  let paymentMethodDetails = JSON.stringify(result);

  let orderId = id;

  let billAountElement = document.querySelector(
    "#total_amount_table #pay-amount"
  );
  let billAmount = billAountElement.textContent;

  let changeAmountElement = document.querySelector(
    "#total_amount_table #change-amount"
  );
  let changeAmount = changeAmountElement.textContent;

  let invoiceInfo = [{ orderId, billAmount, changeAmount }];
  let payNowInfo = [
    {
      orderId,
      billAmount,
      payment_method_id,
      paymentMethodDetails,
    },
  ];
  ipcRenderer.send("PayorderNow", payNowInfo);
  ipcRenderer.send("PaynowBtnClickedForInvoice", invoiceInfo);
}
// final payment for the order end here
