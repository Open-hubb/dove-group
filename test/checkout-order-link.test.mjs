import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const marketplace = readFileSync(new URL("../marketplace.html", import.meta.url), "utf8")

test("checkout carries the captured dashboard order ID into Flot", () => {
  assert.match(
    marketplace,
    /async function payWithFlot\(\)/,
    "the payment flow must wait for order capture before opening checkout"
  )
  assert.match(
    marketplace,
    /await fetch\('https:\/\/dashboard\.flotme\.ai\/api\/public\/order'/,
    "the order-capture request must be awaited"
  )
  assert.match(
    marketplace,
    /await response\.json\(\)/,
    "a successful capture must read the returned order ID"
  )
  assert.match(
    marketplace,
    /params\.set\('orderId',\s*capturedOrder\.orderId\)/,
    "the hosted checkout must receive that exact order ID"
  )
})

test("checkout uses the gateway currency for the captured order", () => {
  assert.match(
    marketplace,
    /currency:\s*'SLE'/,
    "dashboard capture and Flot checkout must use the same currency"
  )
})

test("checkout times out order capture so payment cannot be stuck by a slow dashboard", () => {
  assert.match(marketplace, /new AbortController\(\)/)
  assert.match(marketplace, /signal:\s*controller\.signal/)
})

test("dashboard products with string IDs remain usable in the cart", () => {
  assert.doesNotMatch(
    marketplace,
    /onclick="(?:changeCardQty|addToCart|removeFromCart)\(\$\{(?:product|item)\.id\}/,
    "inline handlers treat a string product ID as a JavaScript identifier"
  )
  assert.match(
    marketplace,
    /addButton\.addEventListener\('click', \(\) => addToCart\(product\.id\)\)/,
    "the add-to-cart button must retain the actual product ID"
  )
  assert.match(
    marketplace,
    /removeButton\.addEventListener\('click', \(\) => removeFromCart\(item\.id\)\)/,
    "cart controls must retain the actual item ID"
  )
})

test("checkout prevents a second capture while the first one is pending", () => {
  assert.match(marketplace, /const payButton = document\.querySelector\('\.pay-btn'\)/)
  assert.match(marketplace, /payButton\.disabled = true/)
  assert.match(marketplace, /payButton\.disabled = false/)
})
