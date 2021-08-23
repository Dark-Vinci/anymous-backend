//let see if itll work

function looping(n) {
    let count = 0;
    let ni = n;

    function init() {
        if (count == n) {
            if (n == 1) {
                n = ni;
                count++;
            } else {
                n--;
                count--;
            }
        } else {
            count++;
        }

        return count;
    }

    return init;
}

let po = looping(2);
for (let i = 0; i < 20; i++) {
    console.log(po());
}

// setInterval(po, 100)