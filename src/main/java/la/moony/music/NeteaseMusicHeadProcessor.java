package la.moony.music;

import lombok.RequiredArgsConstructor;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.model.IModelFactory;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.theme.dialect.TemplateHeadProcessor;
import java.util.Properties;

@Component
@RequiredArgsConstructor
public class NeteaseMusicHeadProcessor implements TemplateHeadProcessor {

    static final PropertyPlaceholderHelper
        PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");

    private final PluginWrapper pluginWrapper;

    @Override
    public Mono<Void> process(ITemplateContext context, IModel model,
        IElementModelStructureHandler structureHandler) {
        final IModelFactory modelFactory = context.getModelFactory();
        model.add(modelFactory.createText(neteaseMusicScript()));
        return Mono.empty();
    }

    private String neteaseMusicScript() {

        final Properties properties = new Properties();
        properties.setProperty("version", pluginWrapper.getDescriptor().getVersion());

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
                <!-- plugin-netease-music start -->
                <script> var playlist = []</script>
                <script src="/plugins/plugin-netease-music/assets/static/netease-music.iife.js?version=${version}"></script>
                <script src="/plugins/plugin-netease-music/assets/static/base.min.js?version=${version}"></script>
                <link rel="stylesheet" href="/plugins/plugin-netease-music/assets/static/style.css?version=${version}" />
                <!-- plugin-netease-music end -->
                """, properties);
    }
}
