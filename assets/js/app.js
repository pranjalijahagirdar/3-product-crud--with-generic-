const cl=console.log;

const productForm = document.getElementById('productForm')
const titleControl = document.getElementById('titleControl')
const priceControl = document.getElementById('priceControl')
const brandControl = document.getElementById('brandControl')
const categoryControl = document.getElementById('categoryControl')
const addProductBtn = document.getElementById('addProductBtn')
const UpdateProductBtn = document.getElementById('UpdateProductBtn')
const productList = document.getElementById('productList')
const spinner = document.getElementById('spinner')

const BASE_URL = `https://crud-6b7ce-default-rtdb.firebaseio.com`
const PRODUCTS_URL = `${BASE_URL}/products.json`

function snackbar(msg, icon){
    Swal .fire({
        title:msg,
        icon:icon,
        timer:3000
    })
}

function showSpinner(){
    spinner.classList.remove('d-none')
}
function hideSpinner(){
    spinner.classList.add('d-none')
}

const state = {
    productArr:[],
    editId:null,
}

function objToArr(data){
    for(const key in data){
        data[key].id = key;
        state.productArr.unshift(data[key])
    }
}

function makeApicall(URL, methodName, body=null){
    return fetch(URL,{
        method:methodName,
        headers:{
            "content-type":"application/json",
            "Auth":"TOKEN JWT"
        },
        body:body?JSON.stringify(body):null
    })
    .then(res=>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
}
fetchproduct()

//read

function fetchproduct(){
    showSpinner();
    makeApicall(PRODUCTS_URL,"GET")
    .then(data=>{
        cl(data);
        objToArr(data);
        oncreateProduct(state.productArr)
    })
    .catch(err=>{
        cl(err);
        snackbar(err,'error');
    })
    .finally(()=>{
        hideSpinner()
    });
}

function oncreateProduct(arr){
    let result = ``;
    arr.forEach((ele)=>{
        result += `<tr id="${ele.id}">
                                <td>${ele.brand}</td>
                                <td>${ele.category}</td>
                                <td>${ele.price}</td>
                                <td>${ele.title}</td>
                                <td onclick="editProduct(this)" class="text-center">
                                    <button class="btn btn-sm text-success" role="button">EDIT</button>
                                </td>
                                <td onclick="deleteProduct(this)" class="text-center">
                                    <button class="btn btn-sm text-danger" role="button">DELETE</button>
                                </td>
                            </tr>`
    })
    productList.innerHTML = result;
}

//create

function onAddProducts(eve){
    eve.preventDefault()
    const productObj={
        brand:brandControl.value,
        category:categoryControl.value,
        price:priceControl.value,
        title:titleControl.value,
    }
    showSpinner()
    makeApicall(PRODUCTS_URL,"POST",productObj)
    .then(res=>{
        productObj.id = res.name,
        state.productArr.unshift(productObj)
        let tr = document.createElement('tr')
        tr.id = productObj.id;
        tr.innerHTML = `<td>${productObj.brand}</td>
                                <td>${productObj.category}</td>
                                <td>${productObj.price}</td>
                                <td>${productObj.title}</td>
                                <td onclick="editProduct(this)" class="text-center">
                                    <button class="btn btn-sm text-success" role="button">EDIT</button>
                                </td>
                                <td onclick="deleteProduct(this)" class="text-center">
                                    <button class="btn btn-sm text-danger" role="button">DELETE</button>
                                </td>`

                        productList.prepend(tr)
                        productForm.reset()
                        snackbar('product added successfully !!!', 'success')
    })
    .catch(err=>{
        snackbar('falied to update product', 'error')
        cl(err)
    })
    .finally(()=>{
        hideSpinner()
    })
}

//edit

function editProduct(ele){
    let editId = ele.closest('tr').id;
    state.editId = editId;
    let EDIT_URL = `${BASE_URL}/products/${editId}.json`;
    showSpinner()
    makeApicall(EDIT_URL,"GET")
    .then(res=>{
       brandControl.value = res.brand;
       categoryControl.value = res.category;
       priceControl.value = res.price;
       titleControl.value = res.title;
       addProductBtn.classList.add('d-none')
       UpdateProductBtn.classList.remove('d-none')
    })
    .catch(err=>{
        snackbar(err,'error')
    })
    .finally(()=>{
        hideSpinner()
    })
}

//update


function onupdateProduct(){
    let updateId = state.editId;
    let UPDATE_URL = `${BASE_URL}/products/${updateId}.json`
    let oldObj = state.productArr.find(b=>b.id === updateId)
    cl(oldObj)
    let updateObj={
        brand:brandControl.value,
        category:categoryControl.value,
        price:priceControl.value,
        title:titleControl.value,
        id:updateId
    }
    showSpinner()
    makeApicall(UPDATE_URL, "PATCH",updateObj)
    .then(res=>{
        let getIndex = state.productArr.findIndex(u=>u.id === updateId)
        state.productArr[getIndex]=updateObj;
        let tr = document.getElementById(updateId)
        tr.innerHTML = `<td>${updateObj.brand}</td>
                                <td>${updateObj.category}</td>
                                <td>${updateObj.price}</td>
                                <td>${updateObj.title}</td>
                                <td onclick="editProduct(this)" class="text-center">
                                    <button class="btn btn-sm text-success" role="button">EDIT</button>
                                </td>
                                <td onclick="deleteProduct(this)" class="text-center">
                                    <button class="btn btn-sm text-danger" role="button">DELETE</button>
                                </td>`

                productForm.reset()
                addProductBtn.classList.remove('d-none')
                UpdateProductBtn.classList.add('d-none')
    })
    .catch(err=>{
        snackbar('failed to update product !!!', 'error')
    })
    .finally(()=>{
        hideSpinner()
    })
}

//delete

function deleteProduct(ele){
    let removeId = ele.closest('tr').id;
     Swal.fire({
  title: "Are you sure?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, Remove it!"
}).then((result) => {
  if (result.isConfirmed) {
    showSpinner()
    let REMOVE_URL = `${BASE_URL}/products/${removeId}.json`;
    makeApicall(REMOVE_URL,"DELETE")
    .then(res => {
        let getIndex = state.productArr.findIndex(m=>m.id === removeId)
        state.productArr.splice(getIndex,1)
        ele.closest('tr').remove()
        snackbar(`The product removed successfully !!`,'success')
    })
    .catch(err =>{
        snackbar(err,'error')
    })
    .finally(()=>{
        hideSpinner()
    })
  }
});

}

productForm.addEventListener('submit', onAddProducts)
UpdateProductBtn.addEventListener('click', onupdateProduct)