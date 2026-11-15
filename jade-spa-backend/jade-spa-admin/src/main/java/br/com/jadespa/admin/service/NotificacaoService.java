package br.com.jadespa.admin.service;

import br.com.jadespa.admin.model.Agendamento;
import br.com.jadespa.admin.model.Notificacao;
import br.com.jadespa.admin.repository.NotificacaoRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificacaoService {

    private final NotificacaoRepository repository;

    public NotificacaoService(NotificacaoRepository repository) {
        this.repository = repository;
    }

    public Notificacao criar(
        String email,
        String titulo,
        String mensagem,
        String tipo
    ) {
        Notificacao notificacao = new Notificacao();

        notificacao.setClienteEmail(
            email.trim().toLowerCase()
        );

        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setTipo(tipo);
        notificacao.setLida(false);

        return repository.save(notificacao);
    }

    public void notificarNovoAgendamento(Agendamento agendamento) {

        boolean aula = "AULA".equalsIgnoreCase(
            agendamento.getTipo()
        );

        String titulo = aula
            ? "Inscrição em aula confirmada"
            : "Agendamento confirmado";

        String detalhe;

        if (aula) {
            detalhe = "Aula: " + agendamento.getNomeItem()
                + " — " + agendamento.getDiaSemana()
                + " às " + agendamento.getHorario() + ".";
        } else {
            detalhe = "Tratamento: " + agendamento.getNomeItem()
                + " — " + agendamento.getData()
                + " às " + agendamento.getHorario() + ".";
        }

        criar(
            agendamento.getClienteEmail(),
            titulo,
            detalhe + " Seu agendamento foi confirmado.",
            aula ? "AULA" : "TRATAMENTO"
        );
    }

    public void notificarCancelamento(Agendamento agendamento) {

        boolean aula = "AULA".equalsIgnoreCase(
            agendamento.getTipo()
        );

        String detalhe;

        if (aula) {
            detalhe = "Aula: " + agendamento.getNomeItem()
                + " — " + agendamento.getDiaSemana()
                + " às " + agendamento.getHorario() + ".";
        } else {
            detalhe = "Tratamento: " + agendamento.getNomeItem()
                + " — " + agendamento.getData()
                + " às " + agendamento.getHorario() + ".";
        }

        criar(
            agendamento.getClienteEmail(),
            "Agendamento cancelado",
            detalhe + " O cancelamento foi registrado com sucesso.",
            "CANCELAMENTO"
        );
    }
}