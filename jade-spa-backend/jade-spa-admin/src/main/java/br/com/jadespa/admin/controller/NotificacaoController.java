package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.model.Notificacao;
import br.com.jadespa.admin.repository.NotificacaoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes")
@CrossOrigin(origins = "*")
public class NotificacaoController {

    private final NotificacaoRepository repository;

    public NotificacaoController(
        NotificacaoRepository repository
    ) {
        this.repository = repository;
    }

    @GetMapping("/cliente")
    public List<Notificacao> listarPorCliente(
        @RequestParam String email
    ) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe o e-mail do cliente."
            );
        }

        return repository
            .findAllByClienteEmailIgnoreCaseOrderByCriadaEmDesc(
                email.trim()
            );
    }

    @PatchMapping("/{id}/lida")
    public Notificacao marcarComoLida(
        @PathVariable Long id,
        @RequestParam String email
    ) {
        Notificacao notificacao = buscarDoCliente(id, email);

        notificacao.setLida(true);

        return repository.save(notificacao);
    }

    @PatchMapping("/lidas")
    @Transactional
    public Map<String, Object> marcarTodasComoLidas(
        @RequestParam String email
    ) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe o e-mail do cliente."
            );
        }

        List<Notificacao> notificacoes =
            repository
                .findAllByClienteEmailIgnoreCaseOrderByCriadaEmDesc(
                    email.trim()
                );

        notificacoes.forEach(n -> n.setLida(true));

        repository.saveAll(notificacoes);

        return Map.of(
            "mensagem", "Notificações marcadas como lidas.",
            "quantidade", notificacoes.size()
        );
    }

    private Notificacao buscarDoCliente(
        Long id,
        String email
    ) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe o e-mail do cliente."
            );
        }

        Notificacao notificacao = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Notificação não encontrada."
            ));

        if (!notificacao.getClienteEmail()
                .equalsIgnoreCase(email.trim())) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Esta notificação não pertence a este cliente."
            );
        }

        return notificacao;
    }
}
