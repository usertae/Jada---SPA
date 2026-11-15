
document.addEventListener("DOMContentLoaded", () => {
    const botoesCategoria = document.querySelectorAll(".categoria");
    const cardsServico = document.querySelectorAll(".card-servico");
    const contador = document.getElementById("contador-servicos");
    const mensagemVazia = document.getElementById("mensagem-vazia");

    function filtrarServicos(categoria) {
        let quantidade = 0;

        cardsServico.forEach(card => {
            const corresponde =
                categoria === "todos" ||
                card.dataset.categoria === categoria;

            card.hidden = !corresponde;

            if (corresponde) {
                quantidade++;
            }
        });

        if (contador) {
            contador.textContent =
                `${quantidade} ${quantidade === 1 ? "serviço" : "serviços"}`;
        }

        if (mensagemVazia) {
            mensagemVazia.hidden = quantidade !== 0;
        }
    }

    botoesCategoria.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesCategoria.forEach(item => {
                item.classList.remove("ativa");
                item.setAttribute("aria-pressed", "false");
            });

            botao.classList.add("ativa");
            botao.setAttribute("aria-pressed", "true");

            filtrarServicos(botao.dataset.categoria);
        });
    });

    filtrarServicos("todos");
});
