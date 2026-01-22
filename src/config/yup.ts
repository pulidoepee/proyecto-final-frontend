import * as yup from 'yup';

yup.setLocale({
  mixed: {
    required: 'Este campo es obligatorio',
    notType: 'El valor introducido no es válido',
    oneOf: 'El valor debe coincidir con uno de los permitidos',
  },

  string: {
    email: 'El formato del email no es correcto',
    min: ({ min }) => `Debe tener al menos ${min} caracteres`,
    max: ({ max }) => `No puede tener más de ${max} caracteres`,
    length: ({ length }) => `Debe tener exactamente ${length} caracteres`,
    matches: 'El formato del campo no es válido',
    url: 'La URL no es válida',
    trim: 'El texto no debe contener espacios al inicio o al final',
    lowercase: 'Debe estar en minúsculas',
    uppercase: 'Debe estar en mayúsculas',
  },

  number: {
    min: ({ min }) => `Debe ser mayor o igual que ${min}`,
    max: ({ max }) => `Debe ser menor o igual que ${max}`,
    lessThan: ({ less }) => `Debe ser menor que ${less}`,
    moreThan: ({ more }) => `Debe ser mayor que ${more}`,
    positive: 'Debe ser un número positivo',
    negative: 'Debe ser un número negativo',
    integer: 'Debe ser un número entero',
  },

  date: {
    min: 'La fecha es anterior a la permitida',
    max: 'La fecha es posterior a la permitida',
  },

  boolean: {
    isValue: 'El valor debe ser verdadero o falso',
  },

  array: {
    min: ({ min }) => `Debe tener al menos ${min} elementos`,
    max: ({ max }) => `No puede tener más de ${max} elementos`,
    length: ({ length }) => `Debe tener exactamente ${length} elementos`,
  },
});

export default yup;
