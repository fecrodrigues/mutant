
module.exports = (app) => {

  const {Dna} = app.models;

  const dnaComponent = {

    checkDna(req, res, next) {
      if(req.body && req.body.dna) {
        let isMutant = dnaComponent.checkMutant(req.body.dna);

        //Verificando se DNA existe na base
        Dna.find({dna: req.body.dna}, (err, foundDna) => {
          if(err) res.send(400);

          if(foundDna.length === 0) {
            //Salvando DNA não existente na base
            const dna = new Dna({ dna: req.body.dna, type: isMutant? 'mutant':'human' });
            dna.save().then(() => {
              dnaComponent.sendResponse(res, isMutant);
            });
          } else {
            dnaComponent.sendResponse(res, isMutant);
          }
        })
      } else {
        res.status(400);
        res.json({"message": "DNA not informed!"});
      }
    },

    //Logica de verificação se é mutante ou não
    checkMutant(dna) {
      let isMutant = false;
      let columnLength = dna.length;
      let lineLength = dna[0].length;
      let diagonalMaxLength = columnLength > lineLength? lineLength:columnLength;

      if(columnLength < 4 || lineLength < 4) {
        return false;
      }

      dna.forEach((dnaSequence, index) => {
        console.log(dnaSequence, 'sequence')
        console.log('VERIFICANDO LINHA')
        for(let index = 0; index < dnaSequence.length; index++) {
          console.log(dnaSequence[index]);
          dnaComponent.checkDnaColumn(dna, index, columnLength);
          dnaComponent.checkDnaDiagonal(dna, index, diagonalMaxLength);
        }
        console.log('FIM VERIFICACAO LINHA')

      })

      return isMutant;
    },

    checkDnaDiagonal(dna, lineIndex, diagonalMaxLength) {
      let diagonalLength = diagonalMaxLength - (lineIndex);

      if(diagonalLength >= 4) {
        console.log('VERIFICANDO DIAGONAL LINHA')
        for(let index=0; index < diagonalLength;index++) {
          console.log(dna[index + lineIndex][index]);

          //console.log(dna[index][index + lineIndex]);

        }
        console.log('FIM VERIFICACAO DIAGONAL LINHA')
      } else {
        return false;
      }

    },

    checkDnaColumn(dna, columnIndex, columnLength) {
      console.log('PERCORRENDO COLUNA')
      for(let index=0; index < columnLength; index++) {
        console.log(dna[index][columnIndex])
      }

      console.log('FIM DA COLUNA')
    },

    sendResponse(res, isMutant) {
      if(isMutant) res.send(200);
      res.send(403);
    },

    checkStats(req, res, next) {
     let totalDnas = 0, mutantDnas = 0, humanDnas = 0, ratio = 0;

       dnaComponent.countDna({type: 'mutant'})
         .then(count => {
           mutantDnas = count;
           return dnaComponent.countDna({type: 'human'})
         })
         .then(count => {
           humanDnas = count;
           return dnaComponent.countDna({});
         }).then(totalDnas =>
           res.json(
             {"ADN":
                {
                  "count_mutant_dna": mutantDnas,
                  "count_human_dna": humanDnas,
                  "ratio": dnaComponent.checkRatio(totalDnas, mutantDnas)
                }
              }
           )
         );

     next();
   },

   countDna(filter) {
     return Dna.countDocuments(filter, (err, count) => {
       if(err) res.send(500);
       return count;
     });
   },

   checkRatio(totalValue, valueToDiscoverPercentage) {
     return valueToDiscoverPercentage / totalValue;
   }

  }

  return dnaComponent;
}
