const { ipcRenderer } = require("electron");
const mergeTable = document.getElementById("merge_table");
const paymentMethodDpdown = document.getElementById("payment_method__dropdown");
const totalAmountTable = document.getElementById("total_amount_table");
const cardpaymentOption = document.getElementById("payment_left");
const mainDivPAyment = document.getElementById("field");
const addNewPaymentBtn = document.getElementById("add_more_payment_method");
const paymentMainDiv = document.getElementById("field");
const paynowBtn = document.getElementById("pay_now");
const paymenTDiv = document.getElementById("field");
const customerPayInput = document.getElementById("customer_payment");

let orderIdWithAmountList = [];
let orderIdList = [];
//creating the merge order table for select or unselect the order
ipcRenderer.on("orderInfoForMerge", (e, orderInfo) => {
  orderInfo.map((order) => {
    const orderIdWithTotalAmount = {
      orderId: order.id,
      orderAmount: order.totalamount,
    };
    orderIdWithAmountList.push(orderIdWithTotalAmount);
    orderIdList.push(order.id);
    let tableTr = document.createElement("tr");

    let select = document.createElement("td");
    let inputSelect = document.createElement("input");
    inputSelect.classList.add("chkBox");
    inputSelect.type = "checkbox";
    inputSelect.checked = true;
    inputSelect.id = "check_box";
    select.append(inputSelect);

    let orderNo = document.createElement("td");
    orderNo.textContent = order.saleinvoice;

    let totalAmount = document.createElement("td");
    totalAmount.id = "merge_total_order";
    totalAmount.textContent = parseFloat(order.totalamount).toFixed(2);

    let paidAmount = document.createElement("td");
    let converttoFloat = parseFloat(order.customerpaid).toFixed(2);
    paidAmount.textContent = converttoFloat;

    let due = document.createElement("td");
    due.textContent = parseFloat(order.totalamount).toFixed(2);
    tableTr.append(select, orderNo, totalAmount, paidAmount, due);
    mergeTable.append(tableTr);
  });
});
//End of creating the merge order table for select or unselect the order

//pAyment method type dropdown
ipcRenderer.on("PaymentMethodInfoForMerge", (e, paymentMethod) => {
  let options = "";
  paymentMethod.map((payment) => {
    options += ` <option value="${payment.payment_method_id}">${payment.payment_method}</option>`;
  });
  paymentMethodDpdown.innerHTML += options;
});

//when payment method type is card
function showhidecard(hiddenDivId, element) {
  document.getElementById("payment_left").style.display =
    element.value == "1" ? "block" : "none";
  let paymentType = mainDivPAyment.querySelector("#payment_method__dropdown");
  paymentTypeId = paymentType.options[paymentType.selectedIndex].value;
}

ipcRenderer.on("cardWithBankList", (e, cardWithBank) => {
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
        <input type="text" class="form-control" name="last4digit" value="" />
    </div>
  
  </div>`;

  cardpaymentOption.innerHTML = content;
  cardpaymentOption.style.display = "none";
});
// ||end of card payment method works

// calculating the change and due order inside total amount table
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

//addding multiple payment method list
let next = 0;
addNewPaymentBtn.addEventListener("click", (e) => {
  e.preventDefault();
  next = next + 1;

  let divId = document.getElementById("field").id;

  let uniqueId = divId + next;
  let cln = document
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
// addding multiple payment method list end here

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
// ||remove specific payment  method end here

//calculating total amount while checked or unchekd the checkboxes for  merge payment
(function () {
  setTimeout(() => {
    let merge_table = document.querySelector("#merge_table"); //TO CATCH THE MAIN TABLE
    let mergeTableInput = [...merge_table.querySelectorAll("tr input")]; // GETTING ALL INPUT

    let totalAmounts = [];
    let amount = 0;
    mergeTableInput.map((item) => {
      let strAmount =
        item.parentElement.nextElementSibling.nextElementSibling.textContent; // GETTING AMOUNT FROM ALL INPUT
      amount = parseFloat(strAmount);
      amount.toFixed(2);
      totalAmounts.push(amount);

      //calculate the initial selected items total amount and set them to a table
      let totalInitial = 0;
      totalAmounts.map((total) => {
        totalInitial += total;
      });
      content = ` <tr>
      <td>
          Total Amount
      </td>
      <td id="totalamount_marge">  ${totalInitial}</td>
      </tr>
      <tr>
          <td>
              Total Due
          </td>
          <td id="due-amount">  ${totalInitial}</td>
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
      totalAmountTable.innerHTML = content;
      //set customer input value
      customerPayInput.value = totalInitial;

      // end the inital table setting

      //checked and unchecekd total amount calculation
      item.addEventListener("click", () => {
        if (!item.checked) {
          let strAmount =
            item.parentElement.nextElementSibling.nextElementSibling
              .textContent;
          amount = parseFloat(strAmount);
          totalAmounts = totalAmounts.filter((item) => item !== amount);
        } else {
          let strAmount =
            item.parentElement.nextElementSibling.nextElementSibling
              .textContent;
          amount = parseFloat(strAmount);
          totalAmounts.push(amount);
        }

        let totalAmount = 0;
        totalAmounts.map((total) => {
          totalAmount += total;
        });

        // set total amount after checked event or unchecked event
        document.getElementById("totalamount_marge").innerHTML = totalAmount;
        document.getElementById("due-amount").innerHTML = totalAmount;

        customerPayInput.value = totalAmount;
      });
      // end checked and unchecekd total amount calculation
    });
  }, 50);
})();

//final payment
paynowBtn.onclick = () => submitMergePay(orderIdWithAmountList, orderIdList);
let mergeOrderId = 0;
function submitMergePay(orderIdWithAmount, orderIdList) {
  mergeOrderId = mergeOrderId + 1;
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
  let paymentMethodDetails = JSON.stringify(result);

  mergePay = [{ orderIdWithAmount, mergeOrderId, paymentMethodDetails }];

  // fetching data for invoice
  let changeAmountElement = document.querySelector(
    "#total_amount_table #change-amount"
  );
  let changeAmount = changeAmountElement.textContent;

  let billAountElement = document.querySelector(
    "#total_amount_table #pay-amount"
  );
  let billAmount = billAountElement.textContent;
  let orderId;
  orderIdList.map((id) => {
    orderId = id;
    console.log("orderId",orderId);
  });
  // let invoiceInfo = [{ orderId, billAmount, changeAmount }];
  let invoiceInfo = [{ orderIdList, orderId,billAmount, changeAmount }];

  console.log("invoiceInfo", invoiceInfo);
  ipcRenderer.send("mergePaymentbtnClickedForInvoice", invoiceInfo);

  //end of fetching data for invoice
  ipcRenderer.send("MergePayment", mergePay);
  ipcRenderer.send("paidMergeOrderIdSent", orderIdList); // to clear the merge order button order ids those orders are being paid
}
