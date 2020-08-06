export const Environment = {
    settings: {
      sharpness : { 
        value : 1.0,
        min: 0.5,
        max: 16.0,
        step: 0.1
      },
      coloring : {
        value : 0,
        items :  [
          {
            text: "None",
            value: 0
          },
          {
            text: "Element",
            value: 1
          },
          {
            text: "Residue",
            value: 2
          },
          {
            text: "Chain",
            value: 3
          }
        ]
      },
      backgroundColor : {
        value: {
          r:0, g:0, b:255, a:1.0
        }
      },
    },
    state : {
      loading: false
    }
  };