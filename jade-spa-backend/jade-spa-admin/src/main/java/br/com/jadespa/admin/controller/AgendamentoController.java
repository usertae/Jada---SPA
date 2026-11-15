package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.model.Agendamento;
import br.com.jadespa.admin.repository.AgendamentoRepository;
import br.com.jadespa.admin.service.NotificacaoService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agendamentos")
@CrossOrigin(origins = "*")
public class AgendamentoController {

    private final AgendamentoRepository repository;
    private final NotificacaoService notificacaoService;

    public AgendamentoController(
        AgendamentoRepository repository,
        NotificacaoService notificacaoService
    ) {
        this.repository = repository;
        this.notificacaoService = notificacaoService;
    }

    // LISTAR TODOS
    @GetMapping
    public List<Agendamento> listar() {
        return repository.findAll(
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC,
                "criadoEm"
            )
        );
    }

    // LISTAR AGENDAMENTOS DE UM CLIENTE
    @GetMapping("/cliente")
    public List<Agendamento> listarPorCliente(
        @RequestParam String email
    ) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe o e-mail do cliente."
            );
        }

        return repository
            .findAllByClienteEmailIgnoreCaseOrderByCriadoEmDesc(
                email.trim()
            );
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public Agendamento buscar(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Agendamento não encontrado."
            ));
    }

    // CADASTRAR
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Agendamento cadastrar(
        @RequestBody Agendamento agendamento
    ) {

        if (agendamento.getTipo() == null ||
            agendamento.getClienteNome() == null ||
            agendamento.getClienteEmail() == null ||
            agendamento.getNomeItem() == null ||
            agendamento.getHorario() == null) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Preencha todos os dados obrigatórios."
            );
        }

        agendamento.setTipo(
            agendamento.getTipo().trim().toUpperCase()
        );

        agendamento.setClienteNome(
            agendamento.getClienteNome().trim()
        );

        agendamento.setClienteEmail(
            agendamento.getClienteEmail().trim().toLowerCase()
        );

        agendamento.setNomeItem(
            agendamento.getNomeItem().trim()
        );

        agendamento.setHorario(
            agendamento.getHorario().trim()
        );

        if (!agendamento.getTipo().equals("AULA") &&
            !agendamento.getTipo().equals("TRATAMENTO")) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Tipo de agendamento inválido."
            );
        }

        if (agendamento.getTipo().equals("AULA")) {

            if (agendamento.getDiaSemana() == null ||
                agendamento.getDiaSemana().isBlank()) {

                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o dia da aula."
                );
            }

            long ocupadas =
                repository.countByTipoAndNomeItemAndDiaSemanaAndHorarioAndStatusNot(
                    "AULA",
                    agendamento.getNomeItem(),
                    agendamento.getDiaSemana(),
                    agendamento.getHorario(),
                    "Cancelado"
                );

            if (ocupadas >= 10) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Essa turma está lotada."
                );
            }

            boolean duplicado =
                repository.existsByTipoAndClienteEmailAndNomeItemAndDiaSemanaAndHorarioAndStatusNot(
                    "AULA",
                    agendamento.getClienteEmail(),
                    agendamento.getNomeItem(),
                    agendamento.getDiaSemana(),
                    agendamento.getHorario(),
                    "Cancelado"
                );

            if (duplicado) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este cliente já está inscrito nesta aula."
                );
            }

        } else {

            if (agendamento.getData() == null) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe a data do tratamento."
                );
            }

            boolean duplicado =
                repository.existsByTipoAndClienteEmailAndNomeItemAndDataAndHorarioAndStatusNot(
                    "TRATAMENTO",
                    agendamento.getClienteEmail(),
                    agendamento.getNomeItem(),
                    agendamento.getData(),
                    agendamento.getHorario(),
                    "Cancelado"
                );

            if (duplicado) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este tratamento já está agendado para esse cliente e horário."
                );
            }
        }

        agendamento.setStatus("Confirmado");

        Agendamento salvo = repository.save(agendamento);

        // NOTIFICA O CLIENTE SOBRE O NOVO AGENDAMENTO
        notificacaoService.notificarNovoAgendamento(salvo);

        return salvo;
    }

    // ATUALIZAR STATUS
    @PatchMapping("/{id}/status")
    public Agendamento atualizarStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> dados
    ) {

        Agendamento agendamento = buscar(id);

        String status = dados.get("status");

        if (status == null ||
            !List.of(
                "Pendente",
                "Confirmado",
                "Concluído",
                "Cancelado"
            ).contains(status)) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Status inválido."
            );
        }

        String statusAnterior = agendamento.getStatus();

        agendamento.setStatus(status);

        Agendamento salvo = repository.save(agendamento);

        // NOTIFICA SOMENTE QUANDO O STATUS MUDA PARA CANCELADO
        if ("Cancelado".equals(status) &&
            !"Cancelado".equals(statusAnterior)) {

            notificacaoService.notificarCancelamento(salvo);
        }

        return salvo;
    }
}