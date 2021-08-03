const { ipcRenderer, ipcMain } = require("electron");
const { lchown } = require("original-fs");

const categoryUl = document.getElementById("category_item");
const foodList = document.getElementById("foods");
const foodByAllCategory = document.getElementById("allCategory");
const cartData = document.getElementById("items_cart");
const cartTable = document.getElementById("itemsOnCart");
const cartImage = document.getElementById("myImg");
const customerTypeDropdown = document.getElementById("c_type_dropdown");
const waiterDropdown = document.querySelector("#waiter_dropdown");
const tableDropdown = document.querySelector("#table_dropdown");
const vatInput = document.querySelector("#vat_input");
const grandInput = document.querySelector("#grand_input");
const placeOrderBtn = document.querySelector("#place_order");
const cookingTimeElement = document.querySelector("#appt-time");
const cancelOrder = document.querySelector("#cancel_order");
const mergeOrderBtn = document.getElementById("merge_order");
const placeNewOrderBtn = document.getElementById("place_neworder");
let posOrder = [];
var today = new Date();
const baseURL = "https://restaurant.bdtask.com/";
cancelOrder.addEventListener("click", () => {});
//different tabs
function pos(evt, posSytem) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(posSytem).style.display = "block";
  evt.currentTarget.className += " active";
}
//pos start here
function gettingTokenItems() {
  let trs = [...document.querySelectorAll("#items_cart tr")];
  let customerName =
    customerTypeDropdown.options[customerTypeDropdown.selectedIndex].value;
  let tokenItems = [];
  trs.map((tr) => {
    const tokenDetails = {
      itemName: tr.querySelector(".item")?.textContent,
      itemQty: tr.querySelector(".food-qty input")?.value,
      size: tr.querySelector(".varient")?.textContent,
      addOnName: tr.querySelector(".addOn")?.textContent,
      addonQty: tr.querySelector(".addon-qty input")?.value,
    };
    tokenItems.push(tokenDetails);
  });
  return tokenItems;
}
function gettingCartItems() {
  let trs = [...document.querySelectorAll("#items_cart tr")];

  let cartItems = [];
  trs.map((tr) => {
    const item = {
      menuId: tr.querySelector(".item")?.id,
      menuQty: tr.querySelector(".food-qty input")?.value,
      addOnId: tr.querySelector(".addOn")?.id,
      addonQty: tr.querySelector(".addon-qty input")?.value,
      varientId: tr.querySelector(".varient")?.id,
    };

    cartItems.push(item);
  });

  return cartItems;
}

//place order here

placeOrderBtn.addEventListener("click", () => {
  let customerId =
    customerTypeDropdown.options[customerTypeDropdown.selectedIndex].value;
  let waiterId = waiterDropdown.options[waiterDropdown.selectedIndex].value;
  let tableNo = tableDropdown.options[tableDropdown.selectedIndex].value;
  let cookingTime = cookingTimeElement.value;
  let vatAmount = document.getElementById("vat_input").value;
  let orderDate =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let orderTime =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let totalAmount = grandInput.value;

  const orderDetails = JSON.stringify(gettingCartItems());
  const tokenDetails = gettingTokenItems();
  console.log("tokenDetails place order", tokenDetails);
  posOrder.push({
    customerId,
    waiterId,
    tableNo,
    cookingTime,
    orderDate,
    orderTime,
    totalAmount,
    orderDetails,
    tokenDetails,
  });
  let billInfo = [];
  billInfo.push({ customerId, totalAmount, vatAmount, orderDate, orderTime });

  ipcRenderer.send("PosOrderItems", posOrder);
  ipcRenderer.send("BillInfoSent", billInfo);
  vatInput.value = "0.0";
  grandInput.value = "0.0";
  cartData.innerHTML = "";
  cartTable.style.display = "none";
  cartImage.style.display = "block";
  location.reload();
  return false;
});

//Foods  on cart
let cartItemList;
ipcRenderer.on("ItemsOnBasketSent", (e, items) => {
  cartItemList = items;
  cartImage.style.display = "none";
  cartTable.style.display = "block";

  const foodItemName = "itemName";
  const cartItems = [
    ...new Map(cartItemList.map((item) => [item[foodItemName], item])).values(),
  ];
  cartItems &&
    cartItems.length !== 0 &&
    cartItems.map((x) => {
      var tr = document.createElement("tr");

      tr.id = x.foodVarients[0].foodId;
      var itemName = document.createElement("td");
      itemName.id = x.foodVarients[0].foodId;
      itemName.classList.add("item");
      itemName.textContent = x.foodVarients[0].itemName;

      var varient = document.createElement("td");
      varient.id = x.foodVarients[0].varientId;
      varient.classList.add("varient");
      varient.textContent = x.foodVarients[0].varient;

      var price = document.createElement("td");
      price.textContent = x.foodVarients[0].foodPrice;

      var qty = document.createElement("td");
      qty.classList.add("food-qty");

      var inpt = document.createElement("input");
      inpt.id = "quantity_input";
      inpt.classList.add("cart-quantity-input");
      inpt.type = "number";
      inpt.value = x.foodVarients[0].quantity;
      inpt.onchange = (e) => updatePriceOnCart(e);
      inpt.style.width = "5em";
      inpt.style.border = "1px solid black";
      qty.appendChild(inpt);

      var total = document.createElement("td");
      total.textContent = x.foodVarients[0].foodTotal;
      total.classList = "foodTotal";

      var remove = document.createElement("td");
      var input = document.createElement("input");
      input.id = "remove_cart_item";
      input.classList.add("remove-cart-quantity");
      input.type = "button";
      input.value = "X";
      input.onclick = () => removeCartItem(x.foodVarients[0].foodId);

      remove.appendChild(input);

      tr.append(itemName, varient, price, qty, total, remove);
      cartData.appendChild(tr);
    });

  const addonsArr = cartItemList[0].addonItems;
  const foodName = "addOnName";
  const foodAddons = [
    ...new Map(addonsArr.map((item) => [item[foodName], item])).values(),
  ];
  foodAddons &&
    foodAddons.length !== 0 &&
    foodAddons.map((addOnItem) => {
      let trV = document.createElement("tr");
      trV.id = addOnItem.foodId;

      let addOnName = document.createElement("td");
      addOnName.textContent = addOnItem.addOnName;
      addOnName.id = addOnItem.addOnId;
      addOnName.className = "addOn";

      let emp = document.createElement("td");
      emp.textContent = "";

      let priceVarient = document.createElement("td");
      priceVarient.textContent = addOnItem.price;

      let qtyV = document.createElement("td");
      qtyV.classList.add("addon-qty");
      let inpt = document.createElement("input");
      inpt.id = "quantity_input";
      inpt.classList.add("cart-quantity-input");
      inpt.type = "number";
      inpt.value = addOnItem.addsOnquantity;
      inpt.onchange = (e) => updatePriceOnCart(e);
      inpt.style.width = "5em";
      inpt.style.border = "1px solid black";
      qtyV.appendChild(inpt);

      let totalV = document.createElement("td");
      totalV.textContent = addOnItem.addOntotal;
      totalV.classList = "foodTotal";
      let removeV = document.createElement("td");
      removeV.textContent = "";

      trV.append(addOnName, emp, priceVarient, qtyV, totalV, removeV);
      cartData.append(trV);
    });
});

ipcRenderer.on("ItemsOnBasketSent", (e, r) => {
  let cartTotal = updateCartTotal();
  let vat = parseFloat((cartTotal / 100) * 15).toFixed(2);
  vatInput.value = vat;
  let grand = cartTotal * ((100 + 15) / 100);
  let grandWithTax = parseFloat(grand).toFixed(2);
  grandInput.value = grandWithTax;
});

function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName("cart_container")[0];
  let cartRows = cartItemContainer.querySelectorAll("#items_cart tr");
  var total = 0;
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    const totalPriceElement = cartRow.getElementsByClassName("foodTotal")[0];
    let subTotalprice = parseInt(totalPriceElement?.textContent);
    total = total + subTotalprice;
  }
  //rounding the total into 2 Decimal place
  total = Math.round((total + Number.EPSILON) * 100) / 100;

  return total;
}

//table dropdown
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("tableSent");
});
ipcRenderer.on("tableReplySent", (e, tableList) => {
  var option;
  tableList.map((table) => {
    option += ` <option value="${table.tableid}">${table.tablename}</option>`;
  });
  tableDropdown.innerHTML += option;
});
//table dropdown end here

//waiter dropdown
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("waiterDropdown");
});
ipcRenderer.on("waiterListSent", (e, waiterDropdownList) => {
  var option;
  waiterDropdownList.map((waiter) => {
    option += ` <option value="${waiter.emp_his_id}">${waiter.first_name}</option>`;
  });
  waiterDropdown.innerHTML += option;
});
//waiter dropdown end here

//customer type dropdown
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("customerTypeDropdownLoaded");
});
ipcRenderer.on("customerTypeDropdownLoadedSent", (e, customerTypeList) => {
  var option;
  customerTypeList.map((customerType) => {
    option += ` <option value="${customerType.customer_type_id}">${customerType.customer_type}</option>`;
  });
  customerTypeDropdown.innerHTML += option;
});
//customer type dropdown end here
function removeCartItem(id) {
  let fID = id;
  let trs = [...document.querySelectorAll("#items_cart tr")];

  if (trs.length == 1) {
    cartTable.style.display = "none";
    cartImage.style.display = "block";
  }
  trs.map((tr) => {
    if (tr.id == fID) {
      tr.remove();
      updateCartTotal();

      var cartTotal = updateCartTotal();

      let vat = parseFloat((cartTotal / 100) * 15).toFixed(2);
      vatInput.value = vat;
      var grand = cartTotal * ((100 + 15) / 100);
      var grandWithTax = parseFloat(grand).toFixed(2);
      grandInput.value = grandWithTax;
    }
  });
}

function updatePriceOnCart(e) {
  var quantity = e.target.value;
  var price = e.target.parentElement.previousElementSibling.textContent;
  var subTotal = quantity * price;
  var total = e.target.parentElement.nextElementSibling;
  total.textContent = subTotal;
  updateCartTotal();
  var cartTotal = updateCartTotal();

  let vat = parseFloat((cartTotal / 100) * 15).toFixed(2);
  vatInput.value = vat;
  let grand = cartTotal * ((100 + 15) / 100);
  let grandWithTax = parseFloat(grand).toFixed(2);
  grandInput.value = grandWithTax;
}

function getFoodId(id) {
  ipcRenderer.send("foodIdSent", id);
}

//sending category id to fetch foods by specific category
function getCategoryId(id) {
  console.log("Catgory Id", id);
  ipcRenderer.send("categoryId", id);
}

//creating dynamic category on pos page
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("categoryNamesLoaded");
});

ipcRenderer.on("categoryNamesReplySent", function (event, results) {
  results.forEach(function (result) {
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.textContent = result.Name;
    li.appendChild(a);
    li.onclick = () => getCategoryId(result.CategoryID);
    categoryUl.appendChild(li);
  });
});
//end of dynamic category on pos page

// displaying food by category
ipcRenderer.on("foodsByCategoryReplySent", (evt, foods) => {
  foodList.innerHTML = "";
  var div = "";

  foods.forEach((food) => {
    div += `
    <div class=" col-lg-3 col-sm-4 col-6">
    <a href="#" class="card text-decoration-none food-item" id=${food.ProductsID} onclick = {getFoodId(${food.ProductsID})}>
    <img src="${baseURL}${food.ProductImage}" height="100" width="206" class="card-img-top">
      <div class="food_items" style="text-align: center;"><h3 class="item-details-title"> 
      ${food.ProductName}
        </h3>
      </div>
      </a>
      </div>`;
  });

  foodList.innerHTML += div;
});

// displaying food by all  category
foodByAllCategory.addEventListener("click", () => {
  ipcRenderer.send("foodByALlCategory");
});
ipcRenderer.on("foodsByAllCategoryReplySent", (evt, foods) => {
  foodList.innerHTML = "";
  var div = "";
  foods.forEach((food) => {
    div += `
    <div class="col-lg-3 col-sm-4 col-6">
    <a href="#" class="card text-decoration-none food-item" id=${food.ProductsID} onclick = {getFoodId(${food.ProductsID})}>
    <img src="${baseURL}${food.ProductImage}" height="100" width="206" class="card-img-top">
      <div class="food_items" style="text-align: center;"><h3 class="item-details-title">
      ${food.ProductName}
       </h3>
      </div>
      </a>
    </div>`;
  });
  foodList.innerHTML += div;
});
// end of displaying food by all category

// displaying the foods when the page loaded
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("foodOnPageLoaded");
});
ipcRenderer.on("foodOnPageLoadedReplySent", (evt, foods) => {
  foodList.innerHTML = "";
  var div = "";
  foods.forEach((food) => {
    div += `
    <div class=" col-lg-3 col-sm-4 col-6" >
    <a href="#" class="card text-decoration-none food-item" id=${food.ProductsID} onclick = {getFoodId(${food.ProductsID})}>
      <img src="${baseURL}${food.ProductImage}" height="100" width="206" class="card-img-top">
      <div class="food_items" style="text-align: center;"><h3 class="item-details-title">${food.ProductName}</h3>
      </div>
      </a>
    </div>`;
  });
  foodList.innerHTML += div;
});

//pos ends here

//ongoing order start here
const ongoingContainer = document.getElementById("ongoing_container");
const ongoingOrderbtn = document.getElementById("ongoing_order");
const mergeChkbox = document.getElementById("merge_chkbox");

ongoingOrderbtn.addEventListener("click", () => {
  ipcRenderer.send("ongoingOrderLoaded");
});
let checkBoxIdList = [];
function chkBoxclicked(checkboxElem, id) {
  if (checkboxElem.checked) {
    checkBoxIdList.push(id);
  } else {
    checkBoxIdList = checkBoxIdList.filter((item) => item !== id); //remove the unchecked items from the array
  }
}
ipcRenderer.on("paidMergeOrderId", (e, paidOrderId) => {
  paidOrderId.map((orderId) => {
    console.log("Paid orderId", orderId);
    checkBoxIdList = checkBoxIdList.filter((item) => item !== orderId);
  });
});
mergeOrderBtn.setAttribute("onclick", "mergerOrderList(checkBoxIdList)");
ipcRenderer.on("OngoingOrderListSent", (e, ongoingOrderList) => {
  let ongoingContents = "";
  ongoingContainer.innerHTML = "";
  ongoingOrderList.map((ongoingOrder) => {
    ongoingContents += `
    <div class="col-sm-4 col-md-3 col-xs-6 col-xlg-2 mb-2">
        <div class="hero-widget well well-md height-auto">
            <div class="mdjc">
                <label><strong>Table: ${ongoingOrder.tablename}</strong></label>
                <div class="d-flex align-items-center">
                    <div class="iconary"><a href="#" onclick="editPosOrder(${ongoingOrder.id})"
                            class="btn btn-xs btn-success btn-sm mr-1 pdmr" data-toggle="tooltip"
                            data-placement="left" title="" data-original-title="Update Order"
                            id="table-11499"><i class="ti-pencil"></i></a></div>
                    <div class="kitchen-tab bd-pd-overflow">
                        <input id="merge_chkbox" type="checkbox" class="individual"
                            name="margeorder" value="11499" onchange="chkBoxclicked(this,${ongoingOrder.id})">
                           
                    </div>
                </div>
            </div>
            <p class="mb-0">
                <label>Order Number: ${ongoingOrder.saleinvoice}</label>
            </p>
            <p class="mb-0">
                <label>Waiter : ${ongoingOrder.first_name}</label>
            </p>
           
            <div class="allbtn">
                <a href="#" class="btn btn-xs btn-success btn-sm mx-0 my-1" onclick="completeBtnClicked(${ongoingOrder.id})">Complete</a>
                <a href="#" class="btn btn-xs btn-success btn-sm mx-0 my-1" onclick="splitOrderClicked(${ongoingOrder.id})">Split</a>
                <a href="#" class="btn btn-xs btn-danger btn-sm mx-0 my-1 cancelorder"
                    data-toggle="tooltip" data-placement="left" title=""
                    data-original-title="Cancel Order" onclick="cancelOngoingOrder(${ongoingOrder.id})"><i class="ti-close"></i></a>
                <a href="#" class="btn btn-xs btn-success btn-sm mx-0 my-1" data-toggle="tooltip"
                    data-placement="left" title="" data-original-title="Pos Invoice" onclick="orderDetails(${ongoingOrder.id})"><i
                        class="ti-fullscreen"></i></a>
                <a href="#" class="btn btn-xs btn-success btn-sm mx-0 my-1 due_print"
                    data-toggle="tooltip" data-placement="left" title=""
                    data-url="https://restaurant.bdtask.com/demo/ordermanage/order/dueinvoice/11499"
                    data-original-title="Due Invoice" onclick="invoiceBtnClicked(${ongoingOrder.id})"><i class="ti-save"></i></a>
            </div>
        </div>
    
</div>`;
  });
  ongoingContainer.innerHTML += ongoingContents;
});

function mergerOrderList(orderIdList) {
  if (orderIdList.length > 0) {
    ipcRenderer.send("orderIdListForMegreOrder", orderIdList);
  }
}
function splitOrderClicked(splitId) {
  console.log("splitId", splitId);
  ipcRenderer.send("splitOrderIDSent", splitId);
}
function completeBtnClicked(id) {
  ipcRenderer.send("CompleteOngoingOrder:orderIdSent", id);
}
function cancelOngoingOrder(orderId) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          ipcRenderer.send("CancelOngoingOrder:OrderIdSent", orderId),
          "Your file has been deleted.",
          "success"
        );
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          "Cancelled",
          "Your  file is safe :)",
          "error"
        );
      }
    });
}
function orderDetails(id) {
  ipcRenderer.send("OrderDetailsBtnClicked:OrderId", id);
}
function invoiceBtnClicked(id) {
  ipcRenderer.send("InvoiceBtnClicked:OrderId", id);
}

//edit order
function editPosOrder(id) {
  console.log("edit order id", id);
  ipcRenderer.send("editOrderItem", id);
}
//set the fields during edit order
ipcRenderer.on("EditOrderItems", (e, editOrderDetails) => {
  editOrderDetails.map((editItem) => {
    //looping through options in  customer type dropdown and set option as selected
    let customerTypeId = editItem.row.customer_type; // getting customer type id of order
    Array.from(document.querySelector("#c_type_dropdown").options).forEach(
      function (option_element) {
        let option_value = option_element.value;
        if (customerTypeId == option_value) {
          option_element.selected = "selected";
        }
      }
    );

    //looping through options in  Waiter  dropdown and set option as selected
    let waiterId = editItem.row.waiter_id; // getting waiter id of the order
    Array.from(document.querySelector("#waiter_dropdown").options).forEach(
      function (option_element) {
        let option_value = option_element.value;
        if (waiterId == option_value) {
          option_element.selected = "selected";
        }
      }
    );

    //looping through options in  TABLE  dropdown and set option as selected
    let tableNo = editItem.row.table_no; // getting waiter id of the order
    Array.from(document.querySelector("#table_dropdown").options).forEach(
      function (option_element) {
        let option_value = option_element.value;
        if (tableNo == option_value) {
          option_element.selected = "selected";
        }
      }
    );
    //set value in cooking time field
    let cookingTime = editItem.row.cookingtime;
    cookingTimeElement.value = cookingTime;

    //set total amount vale duirng edit
    let totalAmount = editItem.row.totalamount;
    grandInput.value = totalAmount.toFixed(1);
  });
});
//set vat for edit order
ipcRenderer.on("VatForEdit", (e, result) => {
  result.map((vatWithId) => {
    //set value in vat field
    vatInput.value = vatWithId.VAT.toFixed(1);
    placeNewOrderBtn.style.display = "none";

    content = `<div class="action-btns d-flex justify-content-left justify-content-xl-end mt-2 mt-xl-0"
    id="update__order">
  
    <input type="button" id="update_order" class="btn btn-success fw-semi-bold me-1"
        name="update_order" value="Update order" onclick="updateOrder(${vatWithId.order_id})">
    </div>`;
    document.getElementById("footerleft").innerHTML = content;
  });
});

//set order items on the cart table
let updateCartData = {};
ipcRenderer.on("OrderDetailsForEdit", (e, orderDetails) => {
  //console.log("order details array length", orderDetails.length);
  updateCartData.items = orderDetails;
  console.log("order details array  ", updateCartData);
  let tr;
  updateCartData.items.map((item) => {
    tr = document.createElement("tr");

    tr.id = item.row.ProductsID;
    let itemName = document.createElement("td");
    itemName.id = item.row.ProductsID;
    itemName.classList.add("item");
    itemName.textContent = item.row.ProductName;

    let varient = document.createElement("td");
    varient.id = item.row.variantid;
    varient.classList.add("varient");
    varient.textContent = item.row.variantName;

    let price = document.createElement("td");
    price.textContent = item.row.price;

    let qty = document.createElement("td");
    qty.classList.add("food-qty");

    let inpt = document.createElement("input");
    inpt.id = "quantity_input";
    inpt.classList.add("cart-quantity-input");
    inpt.type = "number";
    inpt.value = item.qty;
    inpt.onchange = (e) => updatePriceOnCart(e);
    inpt.style.width = "5em";
    inpt.style.border = "1px solid black";
    qty.appendChild(inpt);

    let total = document.createElement("td");
    total.textContent = item.qty * item.row.price;
    total.classList = "foodTotal";

    let remove = document.createElement("td");
    let input = document.createElement("input");
    input.id = "remove_cart_item";
    input.classList.add("remove-cart-quantity");
    input.type = "button";
    input.value = "X";
    input.onclick = () => removeCartItem(item.row.ProductsID);

    remove.appendChild(input);

    tr.append(itemName, varient, price, qty, total, remove);

    cartTable.style.display = "block";
    cartImage.style.display = "none";
    cartData.append(tr);
  });
  console.log("creation of cart table", cartData);
});

function removeUpdateItemsFromCart() {
  let trs = [...document.querySelectorAll("#items_cart tr")];

  trs.map((tr) => {
    tr.remove();
  });
}
//finally update the order
let updateOrderList = [];
function updateOrder(orderId) {
  let customerId =
    customerTypeDropdown.options[customerTypeDropdown.selectedIndex].value;
  let waiterId = waiterDropdown.options[waiterDropdown.selectedIndex].value;
  let tableNo = tableDropdown.options[tableDropdown.selectedIndex].value;
  let cookingTime = cookingTimeElement.value;
  let vatAmount = document.getElementById("vat_input").value;
  let orderDate =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let orderTime =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let totalAmount = grandInput.value;

  const orderDetails = JSON.stringify(gettingCartItems());
  const tokenDetails = gettingTokenItems();

  updateOrderList.push({
    orderId,
    customerId,
    waiterId,
    tableNo,
    cookingTime,
    orderDate,
    orderTime,
    totalAmount,
    orderDetails,
    tokenDetails,
    vatAmount,
  });
  console.log(orderDetails, orderId);

  vatInput.value = "0.0";
  grandInput.value = "0.0";
  removeUpdateItemsFromCart();
  updateCartData = {};
  cartTable.style.display = "none";
  cartImage.style.display = "block";
  ipcRenderer.send("test2", orderId);
  ipcRenderer.send("updateOrder", updateOrderList);
  location.reload();
  return false;
}

//ongoing order end here
