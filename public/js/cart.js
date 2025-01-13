//Cập nhật số lượng sản phẩm trong giỏ hàng
const inputsQuantity = document.querySelectorAll("input[name='quantity']");
if(inputsQuantity.length > 0){
    inputsQuantity.forEach(input => {
        input.addEventListener("change", (e) => {
            const productId = input.getAttribute("product-id");
            const quantity = e.target.value;
            window.location.href=`/cart/update/${productId}/${quantity}`;
        })
    })
}
// End Cập nhật số lượng sản phẩm trong giỏ hàng