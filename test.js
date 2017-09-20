const arr = []

for (let i = 0; i < 300; i++) {
  arr.push(i)
}

console.time('first')
  arr.forEach(num => num)
console.timeEnd('first')

console.time('second')
  arr.forEach(num => 
    arr.forEach(_num => num + _num))
console.timeEnd('second')

console.time('third')
  arr.forEach(num => 
    arr.forEach(_num => 
      arr.forEach(__num => __num + _num + __num)))
console.timeEnd('third')