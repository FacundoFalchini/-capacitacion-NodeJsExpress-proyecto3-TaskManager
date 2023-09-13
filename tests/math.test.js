/*

//Para hacer una prueba se usa test(param1,param2):
//param1 = nombre
//param2 = funcion: si la funcion no tira un error, es un EXITO, sino es un ERROR.


//test("Hello World", () => {});
//test("This should fail", () => {
//  throw new Error("Failure");
//});


const {
  calculateTip,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
} = require("../src/math");

test("Should calculate total with tip", () => {
  const total = calculateTip(10, 0.3);

  
 // if (total !== 13) {
 //   throw new Error("Total tip should be 13. Got: " + total);
 // }
  

  //En lugar de tirar los errores de manera manual, podemos usar las AFIRMACIONES que trae junto el framework JEST.

  expect(total).toBe(13);
});

test("Should calculate total with default tip", () => {
  const total = calculateTip(10);
  expect(total).toBe(12.5);
});

test("Should convert 32 F to 0 C", () => {
  const celsius = fahrenheitToCelsius(32);
  expect(celsius).toBe(0);
});

test("Should convert 0 C to 32 F", () => {
  const fahrenheit = celsiusToFahrenheit(0);
  expect(fahrenheit).toBe(32);
});

//Como PROBAMOS CODIGO ASINCRONICO USING JEST !
//Hay que agregar el --watch al script. (nah esto na q ver)
//Hay que agregar un parametro en la callback para que vea jest, y este no considera el test fallado o aprobado hasta que llamemos a dicho parametro.
test("Async test demo", (done) => {
  setTimeout(() => {
    expect(1).toBe(1);
    done();
  }, 2000);
});

//COMO PROBAR CODIGO DE UNA EXPRESS APLICATION?? ---> USAMOS LA LIBERIA NPM SUPERTEST

*/

test("Hello World", () => {});
