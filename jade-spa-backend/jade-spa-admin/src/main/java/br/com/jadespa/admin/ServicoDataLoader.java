package br.com.jadespa.admin;

import br.com.jadespa.admin.model.Servico;
import br.com.jadespa.admin.repository.ServicoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServicoDataLoader {

    @Bean
    CommandLineRunner carregarServicos(ServicoRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                Servico massagem = new Servico();
                massagem.setNome("Massagem Relaxante");
                massagem.setCategoria("Massagem");
                massagem.setDescricao(
                    "Movimentos suaves para aliviar as tensões e proporcionar um momento de tranquilidade."
                );
                massagem.setDuracaoMinutos(60);
                massagem.setSessoesPorMes(2);
                massagem.setAtivo(true);

                Servico facial = new Servico();
                facial.setNome("Tratamento Facial");
                facial.setCategoria("Tratamento Facial");
                facial.setDescricao(
                    "Uma sessão personalizada para cuidar da pele de acordo com suas necessidades."
                );
                facial.setDuracaoMinutos(60);
                facial.setSessoesPorMes(1);
                facial.setAtivo(true);

                Servico meditacao = new Servico();
                meditacao.setNome("Meditação Guiada");
                meditacao.setCategoria("Bem-estar");
                meditacao.setDescricao(
                    "Um momento de pausa com orientação para praticar atenção plena e respiração."
                );
                meditacao.setDuracaoMinutos(30);
                meditacao.setSessoesPorMes(2);
                meditacao.setAtivo(true);

                repository.save(massagem);
                repository.save(facial);
                repository.save(meditacao);
            }
        };
    }
}